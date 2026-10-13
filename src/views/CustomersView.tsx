import React, { useState } from 'react';
import { Customer, CustomerDebt, WorkshopSettings, Product, OrderOfService } from '../types';
import { 
  Users, UserPlus, Search, Phone, MapPin, Car, AlertCircle, 
  DollarSign, MessageCircle, Plus, CheckCircle2, Trash2, Edit3, X, Percent, Wrench
} from 'lucide-react';
import { formatGs, getAllCurrencies } from '../utils/currency';
import { VehicleServiceModal } from '../components/VehicleServiceModal';

interface CustomersViewProps {
  customers: Customer[];
  settings: WorkshopSettings;
  products?: Product[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onSaveOrder?: (order: OrderOfService) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  products = [],
  onSaveCustomer,
  onDeleteCustomer,
  onSaveOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [vehicleServiceTarget, setVehicleServiceTarget] = useState<{ customer: Customer; vehicle: Customer['registeredVehicles'][0] } | null>(null);

  // New Customer Form State
  const [customerFormData, setCustomerFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    document: '',
    address: '',
    city: 'Curuguaty',
    registeredVehicles: [{ brand: 'Toyota', model: 'Hilux', year: 2018, plate: '' }],
    notes: ''
  });

  // New Debt Form State
  const [debtDescription, setDebtDescription] = useState('Servicio / Repuesto a Plazo');
  const [debtAmountGs, setDebtAmountGs] = useState<number>(500000);
  const [debtDueDate, setDebtDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [customInterestPercent, setCustomInterestPercent] = useState<number>(settings.defaultLateInterestPercent || 5);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.document.includes(searchQuery) ||
    c.registeredVehicles.some(v => v.plate.toLowerCase().includes(searchQuery.toLowerCase()) || v.model.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Total pending receivables
  const totalPendingReceivablesGs = customers.reduce((acc, c) => {
    const customerTotal = c.debts.filter(d => d.status !== 'pagado').reduce((sum, d) => sum + d.totalDueGs, 0);
    return acc + customerTotal;
  }, 0);

  const pendingTotals = getAllCurrencies(totalPendingReceivablesGs, settings.rates);

  const handleOpenNewCustomer = () => {
    setCustomerFormData({
      name: '',
      phone: '+595 ',
      document: '',
      address: '',
      city: 'Curuguaty',
      registeredVehicles: [{ brand: 'Toyota', model: 'Hilux', year: 2018, plate: '' }],
      notes: ''
    });
    setSelectedCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerFormData({ ...customer });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFormData.name?.trim()) return;

    const saved: Customer = {
      id: selectedCustomer?.id || `cli-${Date.now()}`,
      name: customerFormData.name.trim(),
      phone: customerFormData.phone?.trim() || '',
      document: customerFormData.document?.trim() || '',
      address: customerFormData.address?.trim() || '',
      city: customerFormData.city?.trim() || 'Curuguaty',
      registeredVehicles: customerFormData.registeredVehicles || [],
      debts: selectedCustomer?.debts || [],
      notes: customerFormData.notes?.trim() || '',
      createdAt: selectedCustomer?.createdAt || new Date().toISOString()
    };

    onSaveCustomer(saved);
    setIsCustomerModalOpen(false);
  };

  // Add Debt to Customer
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const interestAmountGs = (debtAmountGs * customInterestPercent) / 100;
    const totalDueGs = debtAmountGs + interestAmountGs;

    const newDebt: CustomerDebt = {
      id: `debt-${Date.now()}`,
      description: debtDescription.trim(),
      originalAmountGs: debtAmountGs,
      interestPercent: customInterestPercent,
      interestAmountGs,
      totalDueGs,
      dueDate: debtDueDate,
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      debts: [...selectedCustomer.debts, newDebt]
    };

    onSaveCustomer(updatedCustomer);
    setSelectedCustomer(updatedCustomer);
    setIsDebtModalOpen(false);
  };

  // Apply Late Interest (%) to an existing debt
  const handleApplyLateInterest = (customer: Customer, debtId: string, additionalPercent: number) => {
    const updatedDebts = customer.debts.map(d => {
      if (d.id === debtId) {
        const newPercent = d.interestPercent + additionalPercent;
        const newInterestAmount = (d.originalAmountGs * newPercent) / 100;
        return {
          ...d,
          interestPercent: newPercent,
          interestAmountGs: newInterestAmount,
          totalDueGs: d.originalAmountGs + newInterestAmount,
          status: 'vencido' as const
        };
      }
      return d;
    });

    const updated = { ...customer, debts: updatedDebts };
    onSaveCustomer(updated);
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(updated);
    }
  };

  // Mark debt as Paid
  const handleMarkAsPaid = (customer: Customer, debtId: string) => {
    const updatedDebts = customer.debts.map(d => {
      if (d.id === debtId) {
        return { ...d, status: 'pagado' as const, paidAt: new Date().toISOString() };
      }
      return d;
    });

    const updated = { ...customer, debts: updatedDebts };
    onSaveCustomer(updated);
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(updated);
    }
  };

  // Send WhatsApp Payment Reminder with Late Interest detail
  const handleSendDebtWhatsApp = (customer: Customer, debt: CustomerDebt) => {
    const rawPhone = customer.phone.replace(/\D/g, '');
    const debtCurrencies = getAllCurrencies(debt.totalDueGs, settings.rates);

    let msg = `*RECORDATORIO DE PAGO - ${settings.name.toUpperCase()}*\n`;
    msg += `📍 ${settings.address} (${settings.landmark})\n\n`;
    msg += `Estimado/a *${customer.name}*:\n`;
    msg += `Nos comunicamos cordialmente desde el taller para recordarle el saldo pendiente de su cuenta:\n\n`;
    msg += `📋 *Concepto:* ${debt.description}\n`;
    msg += `💵 *Monto Inicial:* ${formatGs(debt.originalAmountGs)}\n`;
    if (debt.interestPercent > 0) {
      msg += `📈 *Interés por Mora (${debt.interestPercent}%):* +${formatGs(debt.interestAmountGs)}\n`;
    }
    msg += `📅 *Vencimiento:* ${debt.dueDate.split('-').reverse().join('/')}\n\n`;
    msg += `💰 *TOTAL ACTUALIZADO A PAGAR:*\n`;
    msg += `🇵🇾 *${debtCurrencies.gs}*\n`;
    msg += `🇧🇷 *${debtCurrencies.real}*\n`;
    msg += `🇺🇸 *${debtCurrencies.dolar}*\n\n`;
    msg += `Agradecemos coordinar la cancelación a la brevedad. Cualquier consulta estamos a las órdenes.\n`;
    msg += `📞 *Contacto:* ${settings.phone}`;

    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden h-[calc(100vh-115px)] space-y-3 sm:space-y-4">
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="p-3 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] text-neutral-400 block">Clientes Registrados</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{customers.length}</span>
          </div>
          <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-xl text-red-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between shadow-lg md:col-span-2">
          <div>
            <span className="text-[11px] text-neutral-400 block">Cuentas Pendientes por Cobrar (Fiados / Créditos)</span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-red-500 font-mono">{pendingTotals.gs}</span>
              <span className="text-xs font-mono text-amber-300">({pendingTotals.real})</span>
              <span className="text-xs font-mono text-emerald-300">({pendingTotals.dolar})</span>
            </div>
          </div>
          <div className="p-3 bg-amber-950/60 border border-amber-800/40 rounded-xl text-amber-500 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and New Customer Bar */}
      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row gap-2 items-center justify-between shrink-0 shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono, cédula, RUC o placa de vehículo..."
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <button
          onClick={handleOpenNewCustomer}
          className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-950 transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Nuevo Cliente
        </button>
      </div>

      {/* Main Customers and Accounts List */}
      <div className="flex-1 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => {
            const pendingDebts = customer.debts.filter(d => d.status !== 'pagado');
            const totalDue = pendingDebts.reduce((sum, d) => sum + d.totalDueGs, 0);

            return (
              <div
                key={customer.id}
                className="p-3 sm:p-4 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-2xl transition space-y-3"
              >
                {/* Header: Customer Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-bold text-sm sm:text-base">{customer.name}</h4>
                      {customer.document && (
                        <span className="text-[10px] bg-neutral-900 border border-neutral-700 text-neutral-300 px-2 py-0.5 rounded font-mono">
                          DOC: {customer.document}
                        </span>
                      )}
                      {totalDue > 0 ? (
                        <span className="text-[10px] bg-red-950 border border-red-800 text-red-300 font-bold px-2 py-0.5 rounded-full font-mono">
                          Saldo Pendiente: {formatGs(totalDue)}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          Al Día
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-emerald-400" /> {customer.phone}
                      </span>
                      {customer.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" /> {customer.address} - {customer.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setDebtDescription('Servicio / Repuesto a Plazo');
                        setDebtAmountGs(500000);
                        setIsDebtModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                      title="Agregar deuda / crédito a plazo"
                    >
                      <Plus className="w-3.5 h-3.5" /> Cuenta Fiada
                    </button>

                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="p-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-xl transition"
                      title="Editar datos del cliente"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Desea eliminar al cliente ${customer.name}?`)) {
                          onDeleteCustomer(customer.id);
                        }
                      }}
                      className="p-1.5 bg-neutral-850 hover:bg-red-950 text-neutral-500 hover:text-red-400 rounded-xl transition"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Vehicles with 1-click enter to add parts/services */}
                {customer.registeredVehicles.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-neutral-850">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-red-500" /> Vehículos del Cliente (Tocar para entrar y cargar piezas/servicios):
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {customer.registeredVehicles.map((v, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setVehicleServiceTarget({ customer, vehicle: v })}
                          className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 hover:border-red-500 text-neutral-100 text-xs px-3 py-1.5 rounded-xl font-mono flex items-center gap-2 transition active:scale-95 shadow-sm group"
                        >
                          <Car className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                          <span className="font-bold">{v.brand} {v.model} ({v.year})</span>
                          {v.plate && (
                            <span className="bg-neutral-950 border border-neutral-700 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[11px]">
                              {v.plate}
                            </span>
                          )}
                          <span className="bg-red-600/30 text-red-400 border border-red-500/40 text-[10px] px-2 py-0.5 rounded-md font-sans font-bold flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> Entrar al Auto
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debts & Receivables Section */}
                {customer.debts.length > 0 && (
                  <div className="pt-2 border-t border-neutral-850 space-y-2">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Cuentas y Créditos del Cliente:
                    </span>
                    <div className="space-y-1.5">
                      {customer.debts.map(debt => (
                        <div
                          key={debt.id}
                          className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs ${
                            debt.status === 'pagado'
                              ? 'bg-neutral-900/40 border-neutral-800 text-neutral-500'
                              : 'bg-neutral-900 border-neutral-800 text-white'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{debt.description}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                debt.status === 'pagado'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {debt.status === 'pagado' ? 'PAGADO' : 'PENDIENTE'}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              Monto Inicial: {formatGs(debt.originalAmountGs)} • Vencimiento: {debt.dueDate}
                              {debt.interestPercent > 0 && (
                                <span className="text-amber-400 ml-2 font-bold">
                                  (+{debt.interestPercent}% Mora: +{formatGs(debt.interestAmountGs)})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-between sm:justify-end">
                            <span className="font-mono font-bold text-red-500 text-sm">
                              {formatGs(debt.totalDueGs)}
                            </span>

                            {debt.status !== 'pagado' && (
                              <div className="flex items-center gap-1">
                                {/* Apply Extra Late Interest */}
                                <button
                                  onClick={() => handleApplyLateInterest(customer, debt.id, 5)}
                                  className="px-2 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-lg text-[10px] font-bold transition"
                                  title="Cobrar +5% adicional de interés por mora"
                                >
                                  +5% Mora
                                </button>

                                {/* WhatsApp Payment Reminder */}
                                <button
                                  onClick={() => handleSendDebtWhatsApp(customer, debt)}
                                  className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                                  title="Enviar cobro con interés por WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                                  Cobrar
                                </button>

                                {/* Mark as Paid */}
                                <button
                                  onClick={() => handleMarkAsPaid(customer, debt.id)}
                                  className="p-1 bg-neutral-800 hover:bg-emerald-700 text-neutral-400 hover:text-white rounded-lg transition"
                                  title="Marcar como cobrado / pagado"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <Users className="w-12 h-12 mb-2 opacity-30 text-red-500" />
            <h4 className="text-white font-bold text-sm">No se encontraron clientes</h4>
            <p className="text-xs text-neutral-400 mt-1">
              Registre a su primer cliente para llevar el historial y control de créditos.
            </p>
          </div>
        )}
      </div>

      {/* New / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-500" />
                {selectedCustomer ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerForm} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Nombre Completo / Razón Social *</label>
                <input
                  type="text"
                  required
                  value={customerFormData.name || ''}
                  onChange={e => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Juan Carlos Benítez"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white text-xs focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={customerFormData.phone || ''}
                    onChange={e => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+595 98..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">C.I. / RUC</label>
                  <input
                    type="text"
                    value={customerFormData.document || ''}
                    onChange={e => setCustomerFormData(prev => ({ ...prev, document: e.target.value }))}
                    placeholder="Documento"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Dirección / Barrio</label>
                  <input
                    type="text"
                    value={customerFormData.address || ''}
                    onChange={e => setCustomerFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Barrio San Isidro"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white text-xs focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={customerFormData.city || 'Curuguaty'}
                    onChange={e => setCustomerFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white text-xs focus:border-red-500"
                  />
                </div>
              </div>

              {/* Vehicle info */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-red-500 block">🚗 Vehículo del Cliente:</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    value={customerFormData.registeredVehicles?.[0]?.brand || ''}
                    onChange={e => {
                      const v = [...(customerFormData.registeredVehicles || [])];
                      v[0] = { ...v[0], brand: e.target.value };
                      setCustomerFormData(prev => ({ ...prev, registeredVehicles: v }));
                    }}
                    placeholder="Marca (Toyota)"
                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={customerFormData.registeredVehicles?.[0]?.model || ''}
                    onChange={e => {
                      const v = [...(customerFormData.registeredVehicles || [])];
                      v[0] = { ...v[0], model: e.target.value };
                      setCustomerFormData(prev => ({ ...prev, registeredVehicles: v }));
                    }}
                    placeholder="Modelo (Hilux)"
                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={customerFormData.registeredVehicles?.[0]?.plate || ''}
                    onChange={e => {
                      const v = [...(customerFormData.registeredVehicles || [])];
                      v[0] = { ...v[0], plate: e.target.value.toUpperCase() };
                      setCustomerFormData(prev => ({ ...prev, registeredVehicles: v }));
                    }}
                    placeholder="Placa"
                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-950 transition"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt / Credit Modal with % Interest */}
      {isDebtModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  Registrar Cuenta Fiada / Crédito
                </h3>
                <p className="text-xs text-neutral-400">Cliente: {selectedCustomer.name}</p>
              </div>
              <button onClick={() => setIsDebtModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Descripción del Servicio / Repuesto</label>
                <input
                  type="text"
                  required
                  value={debtDescription}
                  onChange={e => setDebtDescription(e.target.value)}
                  placeholder="Ej: Batería Moura 60Ah a plazo"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Monto Original en Guaraníes (Gs.)</label>
                <input
                  type="number"
                  required
                  step="1000"
                  value={debtAmountGs || ''}
                  onChange={e => setDebtAmountGs(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={debtDueDate}
                    onChange={e => setDebtDueDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Interés por Mora (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={customInterestPercent}
                      onChange={e => setCustomInterestPercent(parseFloat(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-amber-300 font-mono font-bold text-xs"
                    />
                    <span className="absolute right-3 top-1.5 text-neutral-500 font-mono">%</span>
                  </div>
                </div>
              </div>

              {/* Total preview with interest */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Monto Base:</span>
                  <span>{formatGs(debtAmountGs)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Interés Recargo ({customInterestPercent}%):</span>
                  <span>+{formatGs((debtAmountGs * customInterestPercent) / 100)}</span>
                </div>
                <div className="pt-1 border-t border-neutral-800 flex justify-between font-bold text-white text-sm">
                  <span>Total con Interés:</span>
                  <span className="text-red-500">{formatGs(debtAmountGs + (debtAmountGs * customInterestPercent) / 100)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-950 transition"
                >
                  Guardar Cuenta Fiada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Service Modal */}
      {vehicleServiceTarget && (
        <VehicleServiceModal
          isOpen={Boolean(vehicleServiceTarget)}
          onClose={() => setVehicleServiceTarget(null)}
          customer={vehicleServiceTarget.customer}
          vehicle={vehicleServiceTarget.vehicle}
          products={products}
          settings={settings}
          onSaveAsOrder={order => {
            if (onSaveOrder) onSaveOrder(order);
          }}
          onAddDebtToCustomer={(customerId, amountGs, desc) => {
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
              const newDebt: CustomerDebt = {
                id: `debt-${Date.now()}`,
                description: desc,
                originalAmountGs: amountGs,
                interestPercent: settings.defaultLateInterestPercent || 5,
                interestAmountGs: 0,
                totalDueGs: amountGs,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'pendiente',
                createdAt: new Date().toISOString()
              };
              const updatedCustomer = {
                ...customer,
                debts: [newDebt, ...customer.debts]
              };
              onSaveCustomer(updatedCustomer);
            }
          }}
        />
      )}
    </div>
  );
};
