import React, { useState } from 'react';
import { Customer, Product, WorkshopSettings, ServiceItem, OrderOfService } from '../types';
import { 
  X, Car, Wrench, Package, Plus, Trash2, Printer, MessageCircle, 
  CheckCircle2, DollarSign, Search, ShieldCheck, FileText, ShoppingCart
} from 'lucide-react';
import { formatGs, getAllCurrencies } from '../utils/currency';

interface VehicleServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    plate: string;
  };
  products: Product[];
  settings: WorkshopSettings;
  onSaveAsOrder: (order: OrderOfService) => void;
  onAddDebtToCustomer?: (customerId: string, amountGs: number, desc: string) => void;
  onTransferToPDV?: (clientName: string, clientPhone: string, items: { product: Product; quantity: number }[]) => void;
}

// 13 Official Workshop Services
const PRESET_WORKSHOP_SERVICES = [
  { name: 'Aire acondicionado en general (Carga y Mantenimiento)', priceGs: 350000, category: 'A/C' },
  { name: 'Programación de caja automática en general', priceGs: 650000, category: 'Electrónica' },
  { name: 'Programación de llaves con chip / transponder', priceGs: 280000, category: 'Llaves' },
  { name: 'Copia de llaves canivete en general', priceGs: 350000, category: 'Llaves' },
  { name: 'Reprogramación de CPU y módulo de inyección', priceGs: 750000, category: 'Electrónica' },
  { name: 'Servicios de eléctrica general automotriz y agrícola', priceGs: 180000, category: 'Eléctrica' },
  { name: 'Venta e instalación de baterías con garantía', priceGs: 650000, category: 'Baterías' },
  { name: 'Limpieza y prueba de inyección (Diesel y Nafta)', priceGs: 280000, category: 'Inyección' },
  { name: 'Mantenimiento general entre aceite y suspensiones', priceGs: 220000, category: 'Mecánica' },
  { name: 'Mecánica en general en autos y camionetas', priceGs: 300000, category: 'Mecánica' },
  { name: 'Parte eléctrica en camiones pesados y maquinaria', priceGs: 450000, category: 'Pesado' },
  { name: 'Reprogramación de pedal en vehículos diesel y nafta', priceGs: 400000, category: 'Electrónica' },
  { name: 'Diagnóstico computarizado y borrado de fallas scanner', priceGs: 150000, category: 'Scanner' },
];

export const VehicleServiceModal: React.FC<VehicleServiceModalProps> = ({
  isOpen,
  onClose,
  customer,
  vehicle,
  products,
  settings,
  onSaveAsOrder,
  onAddDebtToCustomer,
  onTransferToPDV
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'servicios' | 'repuestos'>('servicios');
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState<number>(150000);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [creditSurchargePercent, setCreditSurchargePercent] = useState<number>(0);
  const [reportedProblem, setReportedProblem] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Add workshop service
  const handleAddService = (name: string, priceGs: number) => {
    const newItem: ServiceItem = {
      id: `srv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      description: name,
      quantity: 1,
      unitPriceGs: priceGs,
      totalGs: priceGs,
      type: 'mao_de_obra'
    };
    setItems(prev => [...prev, newItem]);
    if (navigator.vibrate) navigator.vibrate(25);
  };

  // Add custom service
  const handleAddCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customServiceName.trim()) return;
    handleAddService(customServiceName.trim(), customServicePrice);
    setCustomServiceName('');
  };

  // Add product from inventory
  const handleAddProduct = (prod: Product) => {
    const existingIndex = items.findIndex(it => it.productId === prod.id);
    if (existingIndex >= 0) {
      setItems(prev => prev.map((it, idx) => {
        if (idx === existingIndex) {
          const qty = it.quantity + 1;
          return { ...it, quantity: qty, totalGs: it.unitPriceGs * qty };
        }
        return it;
      }));
    } else {
      const newItem: ServiceItem = {
        id: `prod-${Date.now()}-${prod.id}`,
        productId: prod.id,
        description: prod.name,
        quantity: 1,
        unitPriceGs: prod.sellPriceGs,
        totalGs: prod.sellPriceGs,
        type: 'peca'
      };
      setItems(prev => [...prev, newItem]);
    }
    if (navigator.vibrate) navigator.vibrate(25);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setItems(prev => prev.map(it => {
      if (it.id === itemId) {
        const newQty = it.quantity + delta;
        return newQty > 0 ? { ...it, quantity: newQty, totalGs: it.unitPriceGs * newQty } : null;
      }
      return it;
    }).filter(Boolean) as ServiceItem[]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(it => it.id !== itemId));
  };

  // Totals
  const subtotalGs = items.reduce((acc, it) => acc + it.totalGs, 0);
  const partsTotalGs = items.filter(it => it.type === 'peca').reduce((acc, it) => acc + it.totalGs, 0);
  const laborTotalGs = items.filter(it => it.type === 'mao_de_obra').reduce((acc, it) => acc + it.totalGs, 0);
  const discountGs = Math.round((subtotalGs * discountPercent) / 100);
  const creditSurchargeGs = Math.round((subtotalGs * creditSurchargePercent) / 100);
  const totalGs = Math.max(0, subtotalGs - discountGs + creditSurchargeGs);

  const totalCurrencies = getAllCurrencies(totalGs, settings.rates);

  // Filter products for this car
  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase().trim();
    const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q);
    const matchesCar = p.compatibility.length === 0 || p.compatibility.some(c => 
      c.model.toLowerCase().includes(vehicle.model.toLowerCase()) ||
      c.brand.toLowerCase().includes(vehicle.brand.toLowerCase())
    );
    return matchesQuery && (q ? true : matchesCar);
  });

  // Action: Save as Order/Budget
  const handleSaveBudget = (isOfficialOS = false) => {
    if (items.length === 0) {
      alert('Agregue al menos un servicio o repuesto al vehículo.');
      return;
    }

    const order: OrderOfService = {
      id: `${isOfficialOS ? 'OS' : 'PRE'}-${Date.now().toString().slice(-5)}`,
      type: isOfficialOS ? 'ordem_servico' : 'presupuesto',
      client: {
        name: customer.name,
        phone: customer.phone,
        document: customer.document,
        address: `${customer.address} - ${customer.city}`
      },
      vehicle: {
        plate: vehicle.plate || 'S/ PLACA',
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        km: 0
      },
      reportedProblem: reportedProblem || 'Revisión y servicios en Auto Eléctrica Cañete',
      diagnosis: {
        batteryTested: true,
        diagnosisNotes: 'Verificación de sistema eléctrico y repuestos.'
      },
      items,
      totalPartsGs: partsTotalGs,
      totalLaborGs: laborTotalGs,
      discountPercent,
      discountGs,
      creditSurchargePercent,
      creditSurchargeGs,
      totalGs,
      paymentMethod: 'efectivo',
      status: isOfficialOS ? 'em_andamento' : 'orcamento',
      validityDays: 15,
      warranty: '30 días en servicios de taller / Garantía oficial en baterías y repuestos nuevos.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveAsOrder(order);
    setSuccessNotice(`¡${isOfficialOS ? 'Orden de Servicio' : 'Presupuesto'} #${order.id} generado exitosamente!`);
    setTimeout(() => {
      setSuccessNotice(null);
      onClose();
    }, 1500);
  };

  // Action: Add directly to customer's account/debt
  const handleAddDebt = () => {
    if (items.length === 0 || totalGs <= 0) {
      alert('Agregue servicios o repuestos antes de registrar en cuenta.');
      return;
    }
    if (onAddDebtToCustomer) {
      const desc = `Servicios/Repuestos para ${vehicle.brand} ${vehicle.model} [${vehicle.plate}]: ${items.map(i => i.description).join(', ')}`;
      onAddDebtToCustomer(customer.id, totalGs, desc);
      setSuccessNotice(`¡Cuenta fiada de ${formatGs(totalGs)} registrada al cliente ${customer.name}!`);
      setTimeout(() => {
        setSuccessNotice(null);
        onClose();
      }, 1500);
    }
  };

  // Action: Send quote directly via WhatsApp
  const handleSendWhatsApp = () => {
    if (items.length === 0) {
      alert('Agregue repuestos o servicios para enviar el presupuesto.');
      return;
    }

    let text = `*AUTO ELÉCTRICA CAÑETE*\n`;
    text += `📍 Curuguaty - Canindeyú (Al lado de la comisaría)\n`;
    text += `📞 Contácto: +595 983 788199\n\n`;
    text += `🚗 *VEHÍCULO:* ${vehicle.brand} ${vehicle.model} (${vehicle.year}) ${vehicle.plate ? `[Chapa: ${vehicle.plate}]` : ''}\n`;
    text += `👤 *Cliente:* ${customer.name}\n\n`;
    text += `📋 *DETALLE DE SERVICIOS Y REPUESTOS:*\n`;
    items.forEach((it, idx) => {
      text += `${idx + 1}. ${it.description} (${it.quantity}x) = ${formatGs(it.totalGs)}\n`;
    });
    if (discountGs > 0) {
      text += `\n🏷️ Descuento: -${formatGs(discountGs)} (${discountPercent}%)\n`;
    }
    if (creditSurchargeGs > 0) {
      text += `\n💳 Recargo Crédito: +${formatGs(creditSurchargeGs)} (${creditSurchargePercent}%)\n`;
    }
    text += `\n💰 *TOTAL A PAGAR:*\n`;
    text += `🇵🇾 ${totalCurrencies.gs}\n`;
    text += `🇧🇷 ${totalCurrencies.real}\n`;
    text += `🇺🇸 ${totalCurrencies.dolar}\n\n`;
    text += `¡Gracias por elegir Auto Eléctrica Cañete! Presupuesto válido por 15 días.`;

    const cleanPhone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-700/50 text-red-500 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-black text-sm sm:text-base leading-tight">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </h3>
                {vehicle.plate && (
                  <span className="bg-neutral-900 border border-neutral-700 text-amber-400 font-mono text-xs px-2 py-0.5 rounded-lg font-bold">
                    CHAPA: {vehicle.plate}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Propietario: <strong className="text-neutral-200">{customer.name}</strong> • Tel: {customer.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast */}
        {successNotice && (
          <div className="bg-emerald-950 border-b border-emerald-800 p-2.5 text-center text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successNotice}
          </div>
        )}

        {/* Body 2-Column: Left Catalog & Services | Right Current Vehicle Cart */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* LEFT: Add Services or Parts */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-800 overflow-hidden">
            {/* Tabs: Servicios vs Repuestos */}
            <div className="p-2.5 bg-neutral-950 border-b border-neutral-800 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('servicios')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeSubTab === 'servicios'
                    ? 'bg-red-600 text-white shadow-md shadow-red-950'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4" />
                1. Agregar Servicios de Taller
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('repuestos')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeSubTab === 'repuestos'
                    ? 'bg-red-600 text-white shadow-md shadow-red-950'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                2. Agregar Repuestos del Stock
              </button>
            </div>

            {/* Sub-tab 1: Workshop Services */}
            {activeSubTab === 'servicios' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Custom Service Input */}
                <form onSubmit={handleAddCustomService} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customServiceName}
                    onChange={e => setCustomServiceName(e.target.value)}
                    placeholder="Escribir servicio personalizado..."
                    className="flex-1 bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={customServicePrice}
                      onChange={e => setCustomServicePrice(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-neutral-900 border border-neutral-700 text-white font-mono text-xs px-2 py-1.5 rounded-xl text-right"
                      placeholder="Precio Gs."
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </div>
                </form>

                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Servicios Oficiales Auto Eléctrica Cañete:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_WORKSHOP_SERVICES.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-2xl flex flex-col justify-between gap-1.5 transition"
                    >
                      <div>
                        <span className="text-[9px] uppercase font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded">
                          {srv.category}
                        </span>
                        <p className="text-xs text-white font-semibold mt-1 leading-snug">
                          {srv.name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-neutral-850">
                        <span className="font-mono text-xs font-bold text-white">
                          {formatGs(srv.priceGs)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddService(srv.name, srv.priceGs)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar al Auto
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Stock Parts */}
            {activeSubTab === 'repuestos' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-2.5 bg-neutral-950 border-b border-neutral-800">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder={`Buscar repuestos para ${vehicle.model} o código...`}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 text-xs">
                      No se encontraron repuestos con ese filtro.
                    </div>
                  ) : (
                    filteredProducts.map(p => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-2.5 hover:border-neutral-700 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-neutral-900 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-neutral-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="text-white text-xs font-bold truncate">{p.name}</h5>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                              <span>Stock: <strong className={p.stockQuantity > 0 ? "text-emerald-400" : "text-red-500"}>{p.stockQuantity}</strong></span>
                              <span>Cod: {p.barcode}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs font-bold text-white">
                            {formatGs(p.sellPriceGs)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddProduct(p)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" /> Agregar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Vehicle Sheet & Totals */}
          <div className="w-full lg:w-96 flex flex-col bg-neutral-950 overflow-hidden shrink-0">
            <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Car className="w-4 h-4 text-red-500" />
                Piezas y Servicios en el Auto ({items.length})
              </span>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="text-[11px] text-neutral-500 hover:text-red-400 transition"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* List of items added */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[160px] max-h-[300px] lg:max-h-none">
              {items.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs space-y-2">
                  <Car className="w-8 h-8 mx-auto opacity-30 text-red-500" />
                  <p>Aún no ha agregado repuestos ni servicios a este auto.</p>
                  <p className="text-[10px] text-neutral-600">Haga clic en los servicios a la izquierda para cargarlos.</p>
                </div>
              ) : (
                items.map(it => (
                  <div
                    key={it.id}
                    className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                          it.type === 'mao_de_obra' ? 'bg-amber-950 text-amber-300' : 'bg-blue-950 text-blue-300'
                        }`}>
                          {it.type === 'mao_de_obra' ? 'Mano Obra' : 'Repuesto'}
                        </span>
                        <p className="text-white font-medium truncate">{it.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {it.quantity} x {formatGs(it.unitPriceGs)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(it.id, -1)}
                        className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs w-5 text-center text-white">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(it.id, 1)}
                        className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.id)}
                        className="text-neutral-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discounts */}
            <div className="p-3 bg-neutral-900 border-t border-neutral-800 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-neutral-400 block">Descuento (%):</label>
                  <input
                    type="number"
                    value={discountPercent || ''}
                    onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    placeholder="0%"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white font-mono text-xs px-2 py-1 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-neutral-400 block">Recargo Crédito (%):</label>
                  <input
                    type="number"
                    value={creditSurchargePercent || ''}
                    onChange={e => setCreditSurchargePercent(parseFloat(e.target.value) || 0)}
                    placeholder="0%"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white font-mono text-xs px-2 py-1 rounded-lg"
                  />
                </div>
              </div>

              {/* Problem notes */}
              <div>
                <input
                  type="text"
                  value={reportedProblem}
                  onChange={e => setReportedProblem(e.target.value)}
                  placeholder="Problema o motivo del servicio (opcional)..."
                  className="w-full bg-neutral-950 border border-neutral-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              {/* Total Summary */}
              <div className="pt-2 border-t border-neutral-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between items-center text-white font-black text-sm">
                  <span className="font-sans">TOTAL AUTO:</span>
                  <span className="text-red-500 text-base">{totalCurrencies.gs}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-amber-300">🇧🇷 {totalCurrencies.real}</span>
                  <span className="text-emerald-300">🇺🇸 {totalCurrencies.dolar}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSaveBudget(false)}
                    disabled={items.length === 0}
                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Presupuesto
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveBudget(true)}
                    disabled={items.length === 0}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-md shadow-red-950"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Crear Orden (OS)
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddDebt}
                    disabled={items.length === 0}
                    className="flex-1 py-2 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 disabled:opacity-40 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Cuenta Fiada
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    disabled={items.length === 0}
                    className="flex-1 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 disabled:opacity-40 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
