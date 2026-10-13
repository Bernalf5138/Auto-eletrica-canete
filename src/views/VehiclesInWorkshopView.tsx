import React, { useState } from 'react';
import { OrderOfService, Product, WorkshopSettings, Customer, OSStatus } from '../types';
import { 
  Car, Wrench, Clock, CheckCircle2, AlertTriangle, Plus, Search, 
  MessageCircle, Printer, Edit3, Trash2, ChevronRight, ShieldCheck,
  User, Phone, Sparkles, Filter
} from 'lucide-react';
import { OrderFormModal } from '../components/OrderFormModal';
import { PresupuestoPrintModal } from '../components/PresupuestoPrintModal';
import { VehicleServiceModal } from '../components/VehicleServiceModal';
import { formatGs, getAllCurrencies } from '../utils/currency';

interface VehiclesInWorkshopViewProps {
  orders: OrderOfService[];
  customers: Customer[];
  products: Product[];
  settings: WorkshopSettings;
  onSaveOrder: (order: OrderOfService) => void;
  onDeleteOrder: (orderId: string) => void;
  onSaveCustomer?: (customer: Customer) => void;
}

export const VehiclesInWorkshopView: React.FC<VehiclesInWorkshopViewProps> = ({
  orders,
  customers,
  products,
  settings,
  onSaveOrder,
  onDeleteOrder,
  onSaveCustomer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'em_andamento' | 'aguardando_peca' | 'concluido' | 'todos_historico'>('all');
  
  // Modals state
  const [editingOrder, setEditingOrder] = useState<OrderOfService | null>(null);
  const [printingOrder, setPrintingOrder] = useState<OrderOfService | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Vehicle Service quick modal state
  const [vehicleModalData, setVehicleModalData] = useState<{
    customer: Customer;
    vehicle: { brand: string; model: string; year: number; plate: string };
  } | null>(null);

  // Statuses considered currently physically inside the workshop:
  const WORKSHOP_ACTIVE_STATUSES: OSStatus[] = ['em_andamento', 'aguardando_peca', 'concluido', 'aprovado', 'orcamento'];

  // All active vehicles in the workshop
  const activeWorkshopOrders = orders.filter(o => 
    filterStatus === 'todos_historico' 
      ? true 
      : WORKSHOP_ACTIVE_STATUSES.includes(o.status)
  );

  // Metrics
  const countInWorkshop = orders.filter(o => WORKSHOP_ACTIVE_STATUSES.includes(o.status)).length;
  const countInProgress = orders.filter(o => o.status === 'em_andamento' || o.status === 'aprovado').length;
  const countWaitingParts = orders.filter(o => o.status === 'aguardando_peca').length;
  const countReady = orders.filter(o => o.status === 'concluido').length;

  // Filtered orders
  const filteredOrders = activeWorkshopOrders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      o.vehicle.plate.toLowerCase().includes(q) ||
      o.vehicle.brand.toLowerCase().includes(q) ||
      o.vehicle.model.toLowerCase().includes(q) ||
      o.client.name.toLowerCase().includes(q) ||
      (o.reportedProblem && o.reportedProblem.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterStatus === 'all' || filterStatus === 'todos_historico') return true;
    return o.status === filterStatus;
  });

  const handleStatusChange = (order: OrderOfService, newStatus: OSStatus) => {
    const updated: OrderOfService = {
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    onSaveOrder(updated);
  };

  const handleOpenEnterVehicle = (order: OrderOfService) => {
    // Find matching customer or construct temporary customer
    const foundCustomer = customers.find(c => 
      c.name.toLowerCase() === order.client.name.toLowerCase() ||
      (order.client.phone && c.phone === order.client.phone)
    ) || {
      id: `client-${Date.now()}`,
      name: order.client.name,
      phone: order.client.phone || '',
      document: order.client.document || '',
      address: order.client.address || '',
      city: settings.city || 'Curuguaty',
      registeredVehicles: [order.vehicle],
      debts: [],
      createdAt: new Date().toISOString()
    };

    setVehicleModalData({
      customer: foundCustomer,
      vehicle: {
        brand: order.vehicle.brand,
        model: order.vehicle.model,
        year: order.vehicle.year,
        plate: order.vehicle.plate
      }
    });
  };

  const handleSendWhatsAppUpdate = (order: OrderOfService) => {
    if (!order.client.phone) {
      alert('Este cliente no tiene teléfono registrado.');
      return;
    }
    const cleanPhone = order.client.phone.replace(/\D/g, '');
    const cur = getAllCurrencies(order.totalGs, settings.rates);

    let statusText = 'está en proceso de reparación en el taller.';
    if (order.status === 'concluido') statusText = '¡YA ESTÁ LISTO PARA RETIRAR! 🏁';
    if (order.status === 'aguardando_peca') statusText = 'está aguardando la llegada de repuestos.';

    let msg = `Hola *${order.client.name}*, saludos cordiales desde *${settings.name}* en Curuguaty.\n\n`;
    msg += `🚗 *VEHÍCULO EN TALLER:* ${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plate})\n`;
    msg += `🔧 *ESTADO ACTUAL:* ${statusText}\n`;
    if (order.reportedProblem) {
      msg += `📋 *Diagnóstico/Motivo:* ${order.reportedProblem}\n`;
    }
    if (order.items && order.items.length > 0) {
      msg += `\n📦 *Piezas y Trabajos Realizados:*\n`;
      order.items.forEach(it => {
        msg += `• ${it.description} (x${it.quantity}) - ${formatGs(it.totalGs)}\n`;
      });
      msg += `\n💰 *Total Acumulado:* ${cur.gs} (aprox. ${cur.real} | ${cur.dolar})\n`;
    }
    msg += `\nCualquier consulta estamos a las órdenes. ¡Muchas gracias!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleNewVehicleEntry = () => {
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-7xl mx-auto w-full gap-4 pb-20 lg:pb-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-neutral-900 via-neutral-900 to-red-950/40 p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-2xl text-red-500 shadow-inner">
            <Car className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Vehículos en el Taller</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold shadow">
                {countInWorkshop} activos
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Patio activo de autos y camionetas en servicio, repuestos cargados y estado de entrega
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNewVehicleEntry}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-950 transition active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Ingresar Vehículo al Taller</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div 
          onClick={() => setFilterStatus('all')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            filterStatus === 'all' 
              ? 'bg-neutral-900 border-red-500 ring-1 ring-red-500/50 shadow-md' 
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
            <span>En Taller (Total)</span>
            <Car className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{countInWorkshop}</div>
          <p className="text-[10px] text-neutral-500 mt-0.5">Vehículos en el predio</p>
        </div>

        <div 
          onClick={() => setFilterStatus('em_andamento')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            filterStatus === 'em_andamento' 
              ? 'bg-neutral-900 border-sky-500 ring-1 ring-sky-500/50 shadow-md' 
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
            <span>En Reparación</span>
            <Wrench className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{countInProgress}</div>
          <p className="text-[10px] text-neutral-500 mt-0.5">Trabajando actualmente</p>
        </div>

        <div 
          onClick={() => setFilterStatus('aguardando_peca')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            filterStatus === 'aguardando_peca' 
              ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/50 shadow-md' 
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
            <span>Aguardando Piezas</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{countWaitingParts}</div>
          <p className="text-[10px] text-neutral-500 mt-0.5">Esperando repuestos</p>
        </div>

        <div 
          onClick={() => setFilterStatus('concluido')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            filterStatus === 'concluido' 
              ? 'bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md' 
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1">
            <span>Listos para Retiro</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{countReady}</div>
          <p className="text-[10px] text-neutral-500 mt-0.5">Trabajo terminado</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-neutral-900/90 p-2.5 rounded-2xl border border-neutral-800 shadow">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por placa/chapa, modelo, cliente o falla..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              filterStatus === 'all' ? 'bg-red-600 text-white shadow' : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Todos en Taller ({countInWorkshop})
          </button>
          <button
            onClick={() => setFilterStatus('em_andamento')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              filterStatus === 'em_andamento' ? 'bg-sky-600 text-white shadow' : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            En Reparación ({countInProgress})
          </button>
          <button
            onClick={() => setFilterStatus('aguardando_peca')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              filterStatus === 'aguardando_peca' ? 'bg-amber-600 text-white shadow' : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Aguardando ({countWaitingParts})
          </button>
          <button
            onClick={() => setFilterStatus('concluido')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              filterStatus === 'concluido' ? 'bg-emerald-600 text-white shadow' : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Listos ({countReady})
          </button>
          <button
            onClick={() => setFilterStatus('todos_historico')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              filterStatus === 'todos_historico' ? 'bg-neutral-700 text-white shadow' : 'bg-neutral-850 text-neutral-500 hover:text-white'
            }`}
          >
            Historial Salidas
          </button>
        </div>
      </div>

      {/* Grid of Vehicles in Workshop */}
      {filteredOrders.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 my-4">
          <div className="p-4 bg-neutral-800/60 rounded-full text-neutral-500">
            <Car className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-bold text-white">No hay vehículos con este filtro</h3>
          <p className="text-xs text-neutral-400 max-w-md">
            {searchQuery 
              ? 'No se encontraron autos con la búsqueda ingresada.' 
              : 'Actualmente no hay vehículos registrados con este estado en el taller.'}
          </p>
          <button
            onClick={handleNewVehicleEntry}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" /> Ingresar Nuevo Vehículo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredOrders.map(order => {
            const cur = getAllCurrencies(order.totalGs, settings.rates);

            // Status Styling
            let badgeColor = 'bg-neutral-800 text-neutral-300 border-neutral-700';
            let statusLabel = 'Presupuesto';
            if (order.status === 'em_andamento') {
              badgeColor = 'bg-sky-950/80 text-sky-400 border-sky-600/50 animate-pulse';
              statusLabel = 'En Reparación';
            } else if (order.status === 'aguardando_peca') {
              badgeColor = 'bg-amber-950/80 text-amber-400 border-amber-600/50';
              statusLabel = 'Aguardando Piezas';
            } else if (order.status === 'concluido') {
              badgeColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50';
              statusLabel = '¡Listo para Retirar!';
            } else if (order.status === 'entregue') {
              badgeColor = 'bg-neutral-900 text-neutral-400 border-neutral-800';
              statusLabel = 'Entregado al Cliente';
            }

            return (
              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-red-600/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition duration-200 group"
              >
                <div>
                  {/* Top Bar: Plate + Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-neutral-950 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg border border-neutral-700 shadow-sm tracking-wider">
                        {order.vehicle.plate || 'SIN CHAPA'}
                      </span>
                      {order.vehicle.year > 0 && (
                        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                          {order.vehicle.year}
                        </span>
                      )}
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Vehicle Name */}
                  <h3 className="text-base font-extrabold text-white group-hover:text-red-400 transition leading-snug">
                    {order.vehicle.brand} {order.vehicle.model}
                  </h3>

                  {/* Client Info */}
                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-300 bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80">
                    <div className="flex items-center gap-2 truncate">
                      <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-semibold truncate">{order.client.name}</span>
                    </div>

                    {order.client.phone && (
                      <button
                        type="button"
                        onClick={() => handleSendWhatsAppUpdate(order)}
                        className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-600/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                        title="Enviar actualización por WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Avisar</span>
                      </button>
                    )}
                  </div>

                  {/* Reported Problem / Defect Box */}
                  <div className="mt-2.5 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/60 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                      Motivo / Falla Eléctrica:
                    </span>
                    <p className="text-neutral-300 font-medium line-clamp-2 leading-relaxed">
                      {order.reportedProblem || 'Revisión y diagnóstico en general en el taller.'}
                    </p>
                  </div>

                  {/* Items summary */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>🔧 {order.items.length} {order.items.length === 1 ? 'ítem cargado' : 'ítems cargados'}</span>
                      <span className="text-neutral-500 font-mono text-[10px]">O.S. #{order.id.slice(-6)}</span>
                    </div>
                  )}
                </div>

                {/* Footer Section: Total + Action Buttons */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80">
                  {/* Prices */}
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase text-neutral-400">Total en Taller:</span>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400 font-mono leading-none">
                        {cur.gs}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        R$ {cur.real} • US$ {cur.dolar}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <label className="text-[10px] text-neutral-400 font-bold uppercase shrink-0">Estado:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value as OSStatus)}
                      className="flex-1 bg-neutral-950 border border-neutral-700 text-white text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-red-500"
                    >
                      <option value="em_andamento">🔧 En Reparación</option>
                      <option value="aguardando_peca">⏳ Aguardando Piezas</option>
                      <option value="concluido">✅ Listo para Retirar</option>
                      <option value="entregue">🚗 Entregado al Cliente (Salida)</option>
                      <option value="orcamento">📝 Presupuesto Pendiente</option>
                    </select>
                  </div>

                  {/* Primary & Secondary Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEnterVehicle(order)}
                      className="py-2.5 px-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-red-950 transition active:scale-95"
                      title="Entrar al vehículo y cargar piezas o mano de obra"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Cargar Piezas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrintingOrder(order);
                        setIsPrintOpen(true);
                      }}
                      className="py-2.5 px-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                      title="Imprimir o compartir O.S."
                    >
                      <Printer className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Imprimir O.S.</span>
                    </button>
                  </div>

                  {/* Secondary small actions */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-850 text-[11px] text-neutral-400">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingOrder(order);
                        setIsFormOpen(true);
                      }}
                      className="hover:text-white flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3 text-sky-400" /> Editar Falla/Datos
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar la orden del vehículo ${order.vehicle.model} (${order.vehicle.plate})?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="hover:text-red-400 flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3 text-neutral-500 hover:text-red-400" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {/* 1. Vehicle Service Modal (Cargar Piezas y Servicios en el Auto) */}
      {vehicleModalData && (
        <VehicleServiceModal
          isOpen={true}
          onClose={() => setVehicleModalData(null)}
          customer={vehicleModalData.customer}
          vehicle={vehicleModalData.vehicle}
          products={products}
          settings={settings}
          onSaveAsOrder={(newOrder) => {
            onSaveOrder(newOrder);
            setVehicleModalData(null);
          }}
          onAddDebtToCustomer={(customerId, amountGs, desc) => {
            if (onSaveCustomer) {
              const cust = customers.find(c => c.id === customerId);
              if (cust) {
                const newDebt = {
                  id: `debt-${Date.now()}`,
                  description: desc,
                  originalAmountGs: amountGs,
                  interestPercent: settings.defaultLateInterestPercent || 5,
                  interestAmountGs: 0,
                  totalDueGs: amountGs,
                  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  status: 'pendiente' as const,
                  createdAt: new Date().toISOString()
                };
                const updatedCustomer = {
                  ...cust,
                  debts: [newDebt, ...(cust.debts || [])]
                };
                onSaveCustomer(updatedCustomer);
              }
            }
          }}
        />
      )}

      {/* 2. Order Form Modal (Ingresar nuevo vehículo o editar) */}
      <OrderFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOrder(null);
        }}
        order={editingOrder}
        products={products}
        settings={settings}
        onSave={(saved) => {
          onSaveOrder(saved);
          setIsFormOpen(false);
          setEditingOrder(null);
        }}
      />

      {/* 3. Print / Share Modal */}
      <PresupuestoPrintModal
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
          setPrintingOrder(null);
        }}
        order={printingOrder}
        settings={settings}
      />
    </div>
  );
};
