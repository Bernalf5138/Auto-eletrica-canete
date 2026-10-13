import React, { useState, useEffect } from 'react';
import { OrderOfService, Product, ServiceItem, WorkshopSettings, OSStatus } from '../types';
import { X, Plus, Trash2, Zap, User, Car, Wrench, Package } from 'lucide-react';
import { DiscountAndSurchargeTabs } from './DiscountAndSurchargeTabs';
import { formatGs, getAllCurrencies } from '../utils/currency';

interface OrderFormModalProps {
  order: OrderOfService | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: OrderOfService) => void;
  products: Product[];
  settings: WorkshopSettings;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
  products,
  settings
}) => {
  const [type, setType] = useState<'presupuesto' | 'ordem_servico'>('presupuesto');
  const [client, setClient] = useState({ name: '', phone: '', document: '', address: '' });
  const [vehicle, setVehicle] = useState({ plate: '', brand: '', model: '', year: 2018, color: '', km: 85000 });
  const [reportedProblem, setReportedProblem] = useState('');
  const [diagnosis, setDiagnosis] = useState({
    batteryTested: true,
    batteryVoltageRest: 12.5,
    batteryVoltageCranking: 9.8,
    alternatorChargingVoltage: 14.1,
    starterCondition: 'Excelente' as 'Excelente' | 'Escobillas Gastadas' | 'Inducido Dañado' | 'Bendix Patinando' | 'Pesado',
    parasiticDrainMa: 20,
    diagnosisNotes: ''
  });
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [creditSurchargePercent, setCreditSurchargePercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<OrderOfService['paymentMethod']>('efectivo');
  const [status, setStatus] = useState<OSStatus>('orcamento');
  const [validityDays, setValidityDays] = useState(15);
  const [warranty, setWarranty] = useState('90 días de garantía escrita en repuestos y mano de obra');

  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    if (order) {
      setType(order.type);
      setClient({
        name: order.client.name,
        phone: order.client.phone,
        document: order.client.document || '',
        address: order.client.address || ''
      });
      setVehicle({
        plate: order.vehicle.plate,
        brand: order.vehicle.brand,
        model: order.vehicle.model,
        year: order.vehicle.year,
        color: order.vehicle.color || '',
        km: order.vehicle.km
      });
      setReportedProblem(order.reportedProblem || '');
      setDiagnosis({
        batteryTested: order.diagnosis?.batteryTested ?? true,
        batteryVoltageRest: order.diagnosis?.batteryVoltageRest ?? 12.5,
        batteryVoltageCranking: order.diagnosis?.batteryVoltageCranking ?? 9.8,
        alternatorChargingVoltage: order.diagnosis?.alternatorChargingVoltage ?? 14.1,
        starterCondition: order.diagnosis?.starterCondition ?? 'Excelente',
        parasiticDrainMa: order.diagnosis?.parasiticDrainMa ?? 20,
        diagnosisNotes: order.diagnosis?.diagnosisNotes ?? ''
      });
      setItems(order.items || []);
      setDiscountPercent(order.discountPercent || 0);
      setCreditSurchargePercent(order.creditSurchargePercent || 0);
      setPaymentMethod(order.paymentMethod || 'efectivo');
      setStatus(order.status || 'orcamento');
      setValidityDays(order.validityDays || 15);
      setWarranty(order.warranty || '90 días de garantía escrita en repuestos y mano de obra');
    } else {
      setType('presupuesto');
      setClient({ name: '', phone: '+595 ', document: '', address: '' });
      setVehicle({ plate: '', brand: 'Toyota', model: 'Hilux', year: 2018, color: '', km: 0 });
      setReportedProblem('');
      setDiagnosis({
        batteryTested: true,
        batteryVoltageRest: 12.5,
        batteryVoltageCranking: 9.8,
        alternatorChargingVoltage: 14.1,
        starterCondition: 'Excelente',
        parasiticDrainMa: 20,
        diagnosisNotes: ''
      });
      setItems([]);
      setDiscountPercent(0);
      setCreditSurchargePercent(0);
      setStatus('orcamento');
      setValidityDays(15);
      setWarranty('90 días de garantía escrita en repuestos y mano de obra');
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  const handleAddProductFromStock = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const newItem: ServiceItem = {
      id: `item-${Date.now()}`,
      productId: prod.id,
      description: `${prod.name}`,
      quantity: 1,
      unitPriceGs: prod.sellPriceGs,
      totalGs: prod.sellPriceGs,
      type: 'peca'
    };

    setItems(prev => [...prev, newItem]);
    setSelectedProductId('');
  };

  const handleAddLaborItem = () => {
    const newItem: ServiceItem = {
      id: `item-${Date.now()}`,
      description: 'Mano de Obra Especializada',
      quantity: 1,
      unitPriceGs: 250000,
      totalGs: 250000,
      type: 'mao_de_obra'
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof ServiceItem, value: unknown) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unitPriceGs') {
        item.totalGs = (Number(item.quantity) || 0) * (Number(item.unitPriceGs) || 0);
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const totalPartsGs = items.filter(i => i.type === 'peca').reduce((acc, curr) => acc + curr.totalGs, 0);
  const totalLaborGs = items.filter(i => i.type === 'mao_de_obra').reduce((acc, curr) => acc + curr.totalGs, 0);
  const subtotalGs = totalPartsGs + totalLaborGs;
  const discountGs = Math.round((subtotalGs * discountPercent) / 100);
  const creditSurchargeGs = Math.round((subtotalGs * creditSurchargePercent) / 100);
  const finalTotalGs = Math.max(0, subtotalGs - discountGs + creditSurchargeGs);

  const totalCurrencies = getAllCurrencies(finalTotalGs, settings.rates);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.name.trim()) {
      alert("Por favor, ingrese el nombre del cliente.");
      return;
    }

    const prefix = type === 'presupuesto' ? 'PRE' : 'OS';
    const newId = order?.id || `${prefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const savedOrder: OrderOfService = {
      id: newId,
      type,
      client: {
        name: client.name.trim(),
        phone: client.phone.trim(),
        document: client.document.trim(),
        address: client.address.trim()
      },
      vehicle: {
        plate: vehicle.plate.toUpperCase().trim(),
        brand: vehicle.brand.trim(),
        model: vehicle.model.trim(),
        year: Number(vehicle.year) || 2018,
        color: vehicle.color.trim(),
        km: Number(vehicle.km) || 0
      },
      reportedProblem,
      diagnosis,
      items,
      totalPartsGs,
      totalLaborGs,
      discountPercent,
      discountGs,
      creditSurchargePercent,
      creditSurchargeGs,
      totalGs: finalTotalGs,
      paymentMethod,
      status,
      validityDays,
      warranty,
      createdAt: order?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(savedOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-neutral-850 p-1 border border-neutral-750">
              <button
                type="button"
                onClick={() => { setType('presupuesto'); setStatus('orcamento'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  type === 'presupuesto' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Presupuesto
              </button>
              <button
                type="button"
                onClick={() => { setType('ordem_servico'); setStatus('em_andamento'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  type === 'ordem_servico' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Orden de Trabajo
              </button>
            </div>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              {order ? order.id : 'Nuevo Registro'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Status selector */}
          <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex-wrap gap-2">
            <span className="text-neutral-300 font-semibold text-xs">Estado del Trabajo:</span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as OSStatus)}
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:border-red-500"
            >
              <option value="orcamento">📝 Presupuesto Abierto</option>
              <option value="aprovado">👍 Aprobado por el Cliente</option>
              <option value="em_andamento">⚙️ En Taller / En Proceso</option>
              <option value="aguardando_peca">⏳ Esperando Repuesto</option>
              <option value="concluido">✅ Listo para Retirar</option>
              <option value="entregue">🚗 Entregado al Cliente</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>

          {/* Client & Vehicle Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Client Card */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
              <h3 className="text-white font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-red-500">
                <User className="w-4 h-4" /> Datos del Cliente
              </h3>
              <div>
                <label className="block text-neutral-400 text-xs mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={client.name}
                  onChange={e => setClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Juan Carlos Benítez"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">WhatsApp / Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={client.phone}
                    onChange={e => setClient(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+595 98..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs font-mono focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">C.I. / RUC</label>
                  <input
                    type="text"
                    value={client.document}
                    onChange={e => setClient(prev => ({ ...prev, document: e.target.value }))}
                    placeholder="Documento"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs font-mono focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 text-xs mb-1">Dirección / Barrio</label>
                <input
                  type="text"
                  value={client.address}
                  onChange={e => setClient(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Curuguaty"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
                />
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
              <h3 className="text-white font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-red-500">
                <Car className="w-4 h-4" /> Datos del Vehículo
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Placa / Chapa *</label>
                  <input
                    type="text"
                    required
                    value={vehicle.plate}
                    onChange={e => setVehicle(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                    placeholder="CAN-789"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white font-mono font-bold text-xs focus:border-red-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Kilometraje (Km)</label>
                  <input
                    type="number"
                    value={vehicle.km || ''}
                    onChange={e => setVehicle(prev => ({ ...prev, km: parseInt(e.target.value) || 0 }))}
                    placeholder="120000"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:border-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Marca</label>
                  <input
                    type="text"
                    value={vehicle.brand}
                    onChange={e => setVehicle(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Toyota, Scania, JD"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Modelo</label>
                  <input
                    type="text"
                    value={vehicle.model}
                    onChange={e => setVehicle(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Hilux, Gol"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Año</label>
                  <input
                    type="number"
                    value={vehicle.year || ''}
                    onChange={e => setVehicle(prev => ({ ...prev, year: parseInt(e.target.value) || 2018 }))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Color</label>
                  <input
                    type="text"
                    value={vehicle.color}
                    onChange={e => setVehicle(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Plata, Blanco"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reported Problem & Checklist */}
          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Problema Reportado / Reclamo del Cliente
              </label>
              <textarea
                rows={2}
                value={reportedProblem}
                onChange={e => setReportedProblem(e.target.value)}
                placeholder="Ej: No arranca por la mañana; aire no enfría; luz de batería encendida..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
              />
            </div>

            <div className="border-t border-neutral-800 pt-2.5">
              <h4 className="text-white font-bold flex items-center gap-1.5 text-xs text-amber-400 mb-2">
                <Zap className="w-4 h-4" /> Checklist y Diagnóstico Eléctrico
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-0.5">Batería Reposo (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagnosis.batteryVoltageRest || ''}
                    onChange={e => setDiagnosis(prev => ({ ...prev, batteryVoltageRest: parseFloat(e.target.value) || 0 }))}
                    placeholder="12.6"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-0.5">Alternador Carga (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagnosis.alternatorChargingVoltage || ''}
                    onChange={e => setDiagnosis(prev => ({ ...prev, alternatorChargingVoltage: parseFloat(e.target.value) || 0 }))}
                    placeholder="14.2"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-0.5">Motor de Arranque</label>
                  <select
                    value={diagnosis.starterCondition}
                    onChange={e => setDiagnosis(prev => ({ ...prev, starterCondition: e.target.value as typeof diagnosis.starterCondition }))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Escobillas Gastadas">Escobillas Gastadas</option>
                    <option value="Inducido Dañado">Inducido Dañado</option>
                    <option value="Bendix Patinando">Bendix Patinando</option>
                    <option value="Pesado">Pesado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-0.5">Fuga de Corriente (mA)</label>
                  <input
                    type="number"
                    value={diagnosis.parasiticDrainMa || ''}
                    onChange={e => setDiagnosis(prev => ({ ...prev, parasiticDrainMa: parseInt(e.target.value) || 0 }))}
                    placeholder="20"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 font-mono text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items & Services */}
          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-white font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-red-500">
                <Wrench className="w-4 h-4" /> Repuestos y Servicios Aplicados
              </h3>

              <button
                type="button"
                onClick={handleAddLaborItem}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" /> + Mano de Obra
              </button>
            </div>

            {/* Quick add product from stock */}
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="">Seleccione un repuesto del inventario...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ({formatGs(p.sellPriceGs)}) — Stock: {p.stockQuantity}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddProductFromStock}
                disabled={!selectedProductId}
                className="w-full sm:w-auto px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition shrink-0"
              >
                <Package className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            {/* Itemized Table */}
            {items.length > 0 ? (
              <div className="space-y-1.5">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center"
                  >
                    <div className="sm:col-span-2">
                      <select
                        value={item.type}
                        onChange={e => handleUpdateItem(idx, 'type', e.target.value as 'peca' | 'mao_de_obra')}
                        className={`w-full text-xs font-bold rounded-lg px-2 py-1 border border-neutral-700 ${
                          item.type === 'peca' ? 'bg-blue-950 text-blue-300' : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        <option value="peca">Repuesto</option>
                        <option value="mao_de_obra">Mano de Obra</option>
                      </select>
                    </div>

                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleUpdateItem(idx, 'description', e.target.value)}
                        placeholder="Descripción"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-1.5 py-1 text-xs text-white font-mono text-center"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        step="1000"
                        value={item.unitPriceGs}
                        onChange={e => handleUpdateItem(idx, 'unitPriceGs', parseFloat(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-1 text-right font-mono font-bold text-white text-xs truncate">
                      {formatGs(item.totalGs)}
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-neutral-500 hover:text-red-400 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-xl text-center text-xs text-neutral-500">
                Ningún ítem agregado todavía.
              </div>
            )}
          </div>

          {/* DEDICATED DISCOUNT % & CREDIT SURCHARGE % TABS */}
          <DiscountAndSurchargeTabs
            subtotalGs={subtotalGs}
            discountPercent={discountPercent}
            creditSurchargePercent={creditSurchargePercent}
            onChangeDiscount={setDiscountPercent}
            onChangeSurcharge={setCreditSurchargePercent}
          />

          {/* Financial Totals & Payment in 3 Currencies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
            <div>
              <label className="block text-neutral-400 text-xs mb-1">Forma de Pago</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as OrderOfService['paymentMethod'])}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500 font-semibold"
              >
                <option value="efectivo">💵 Efectivo en Guaraníes / Reales / Dólares</option>
                <option value="pix">⚡ Pix Instantáneo</option>
                <option value="tarjeta_credito">💳 Tarjeta de Crédito (+ Recargo)</option>
                <option value="tarjeta_debito">💳 Tarjeta de Débito</option>
                <option value="transferencia">🏦 Transferencia Bancaria</option>
                <option value="credito_plazo">📋 A Plazo / Cuenta Fiada</option>
              </select>
            </div>

            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal:</span>
                <span className="text-white">{formatGs(subtotalGs)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento (-{discountPercent}%):</span>
                  <span>-{formatGs(discountGs)}</span>
                </div>
              )}
              {creditSurchargePercent > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Recargo Crédito (+{creditSurchargePercent}%):</span>
                  <span>+{formatGs(creditSurchargeGs)}</span>
                </div>
              )}
              <div className="pt-1 border-t border-neutral-700 flex justify-between items-center text-sm font-black text-white">
                <span className="font-sans">TOTAL:</span>
                <span className="text-red-500 text-base">{totalCurrencies.gs}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400 pt-0.5">
                <span className="text-amber-300">🇧🇷 {totalCurrencies.real}</span>
                <span className="text-emerald-300">🇺🇸 {totalCurrencies.dolar}</span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-950 transition text-xs"
            >
              {type === 'presupuesto' ? 'Guardar Presupuesto' : 'Guardar Orden de Trabajo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
