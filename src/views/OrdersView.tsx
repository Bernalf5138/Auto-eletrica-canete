import React, { useState } from 'react';
import { OrderOfService, Product, WorkshopSettings, OSStatus } from '../types';
import { 
  FileText, Plus, Search, Printer, MessageCircle, 
  Edit3, Trash2
} from 'lucide-react';
import { OrderFormModal } from '../components/OrderFormModal';
import { PresupuestoPrintModal } from '../components/PresupuestoPrintModal';
import { formatGs } from '../utils/currency';

interface OrdersViewProps {
  orders: OrderOfService[];
  products: Product[];
  settings: WorkshopSettings;
  onSaveOrder: (order: OrderOfService) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  products,
  settings,
  onSaveOrder,
  onDeleteOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'presupuesto' | 'ordem_servico'>('all');

  const [editingOrder, setEditingOrder] = useState<OrderOfService | null>(null);
  const [printingOrder, setPrintingOrder] = useState<OrderOfService | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesType = typeFilter === 'all' || o.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenPrint = (order: OrderOfService) => {
    setPrintingOrder(order);
    setIsPrintOpen(true);
  };

  const handleEdit = (order: OrderOfService) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  const getStatusBadge = (status: OSStatus) => {
    switch (status) {
      case 'orcamento':
        return <span className="bg-amber-950/80 border border-amber-800 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Presupuesto</span>;
      case 'aprovado':
        return <span className="bg-sky-950/80 border border-sky-800 text-sky-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Aprobado</span>;
      case 'em_andamento':
        return <span className="bg-blue-950/80 border border-blue-800 text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-bold">En Taller</span>;
      case 'aguardando_peca':
        return <span className="bg-purple-950/80 border border-purple-800 text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Esperando Repuesto</span>;
      case 'concluido':
        return <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Listo para Entrega</span>;
      case 'entregue':
        return <span className="bg-neutral-800 border border-neutral-700 text-neutral-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Entregado</span>;
      case 'cancelado':
        return <span className="bg-red-950/80 border border-red-800 text-red-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Cancelado</span>;
      default:
        return null;
    }
  };

  const handleSendReadyNotification = (order: OrderOfService) => {
    const rawPhone = order.client.phone.replace(/\D/g, '');
    const msg = `¡Hola *${order.client.name}*! 👋\n` +
      `Le avisamos cordialmente desde *${settings.name}* que su vehículo *${order.vehicle.brand} ${order.vehicle.model} (Placa ${order.vehicle.plate})* ya tiene el servicio concluido y está *LISTO PARA RETIRAR* en nuestro taller. 🚗⚡\n\n` +
      `💰 *Total a pagar:* ${formatGs(order.totalGs)}\n` +
      `📍 *Ubicación:* ${settings.address} (${settings.landmark})\n` +
      `📞 Cualquier consulta estamos a las órdenes: ${settings.phone}`;
    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden h-[calc(100vh-115px)] space-y-3 sm:space-y-4">
      {/* Search & Actions Bar */}
      <div className="p-2.5 sm:p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between shrink-0 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por placa (CAN-789), cliente o número de presupuesto/orden..."
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filters & New Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] ${typeFilter === 'all' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('presupuesto')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] ${typeFilter === 'presupuesto' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'}`}
            >
              Presupuestos
            </button>
            <button
              onClick={() => setTypeFilter('ordem_servico')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] ${typeFilter === 'ordem_servico' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'}`}
            >
              Órdenes de Trabajo
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-950 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Presupuesto / OT
          </button>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="flex-1 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2.5">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="p-3 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition shadow-sm"
            >
              {/* Left Column */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-white text-sm">
                    {order.id}
                  </span>
                  {getStatusBadge(order.status)}
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {new Date(order.createdAt).toLocaleDateString('es-PY')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-white">{order.client.name}</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400 font-mono">{order.client.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-300 flex-wrap">
                  <span className="bg-neutral-900 text-white font-mono font-bold px-2 py-0.5 rounded border border-neutral-700 text-[10px]">
                    {order.vehicle.plate}
                  </span>
                  <span>{order.vehicle.brand} {order.vehicle.model} ({order.vehicle.year})</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400">{order.vehicle.km.toLocaleString('es-PY')} km</span>
                </div>

                {order.reportedProblem && (
                  <p className="text-[11px] text-neutral-400 line-clamp-1 italic">
                    "{order.reportedProblem}"
                  </p>
                )}
              </div>

              {/* Middle Column: Electrical Diagnostics */}
              <div className="hidden lg:flex flex-col text-xs text-neutral-400 bg-neutral-900 p-2 rounded-xl border border-neutral-800/80 min-w-[190px]">
                <span className="text-[10px] uppercase font-bold text-red-400 mb-0.5">⚡ Diagnóstico Eléctrico</span>
                <div className="space-y-0.5 font-mono text-[11px]">
                  <div>Bat: <strong className="text-white">{order.diagnosis.batteryVoltageRest || '-'}V</strong></div>
                  <div>Alt: <strong className="text-emerald-400">{order.diagnosis.alternatorChargingVoltage || '-'}V</strong></div>
                  <div>Arranque: <strong className="text-sky-400">{order.diagnosis.starterCondition || '-'}</strong></div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-900">
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 block">Total a Pagar</span>
                  <span className="text-base sm:text-lg font-black font-mono text-red-500">
                    {formatGs(order.totalGs)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleOpenPrint(order)}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    title="Imprimir presupuesto / orden"
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-300" />
                    Presupuesto
                  </button>

                  <button
                    onClick={() => handleSendReadyNotification(order)}
                    className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    title="Avisar por WhatsApp que está listo"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Avisar
                  </button>

                  <button
                    onClick={() => handleEdit(order)}
                    className="p-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl transition"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Desea eliminar ${order.id}?`)) {
                        onDeleteOrder(order.id);
                      }
                    }}
                    className="p-1.5 bg-neutral-850 hover:bg-red-950 text-neutral-500 hover:text-red-400 rounded-xl transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-neutral-500">
            <FileText className="w-10 h-10 mb-1 opacity-30 text-red-500" />
            <h4 className="text-white font-bold text-xs">No se encontraron registros</h4>
            <p className="text-[11px] text-neutral-400">
              Abra un nuevo presupuesto u orden de trabajo para comenzar.
            </p>
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      <OrderFormModal
        isOpen={isFormOpen}
        order={editingOrder}
        onClose={() => setIsFormOpen(false)}
        onSave={onSaveOrder}
        products={products}
        settings={settings}
      />

      {/* Print Presupuesto Modal */}
      <PresupuestoPrintModal
        isOpen={isPrintOpen}
        order={printingOrder}
        settings={settings}
        onClose={() => setIsPrintOpen(false)}
      />
    </div>
  );
};
