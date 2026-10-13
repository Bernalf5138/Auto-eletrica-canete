import React, { useState } from 'react';
import { OrderOfService, Sale, WorkshopSettings } from '../types';
import { 
  Calendar, MessageCircle, ShieldCheck, HeartHandshake
} from 'lucide-react';

interface AppointmentsAndAfterSalesViewProps {
  orders: OrderOfService[];
  sales: Sale[];
  settings: WorkshopSettings;
}

export const AppointmentsAndAfterSalesView: React.FC<AppointmentsAndAfterSalesViewProps> = ({
  orders,
  settings
}) => {
  // Appointment Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+595 ');
  const [vehicle, setVehicle] = useState('');
  const [serviceType, setServiceType] = useState('Aire Acondicionado en General');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('09:00');

  const handleSendAppointmentWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone.trim() || !clientName.trim()) {
      alert("Por favor, complete el nombre y WhatsApp del cliente.");
      return;
    }

    const rawPhone = clientPhone.replace(/\D/g, '');
    const msg = `🚗⚡ *AGENDAMIENTO - ${settings.name.toUpperCase()}*\n\n` +
      `¡Hola *${clientName}*! Saludos cordiales. Confirmamos su agendamiento en nuestro taller:\n\n` +
      `📅 *Fecha:* ${appointmentDate.split('-').reverse().join('/')}\n` +
      `⏰ *Hora:* ${appointmentTime}\n` +
      `🚘 *Vehículo:* ${vehicle || 'Vehículo del cliente'}\n` +
      `🔧 *Servicio:* ${serviceType}\n\n` +
      `📍 *Dirección:* ${settings.address} (${settings.landmark})\n` +
      `📞 *Contacto:* ${settings.phone}\n\n` +
      `¡Le esperamos! Ante cualquier cambio de horario, favor avisarnos por aquí.`;

    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // After-sales retention notification
  const handleSendAfterSaleCheckup = (order: OrderOfService) => {
    const rawPhone = order.client.phone.replace(/\D/g, '');
    const msg = `¡Hola *${order.client.name}*! ¿Cómo está? Le saludamos de *${settings.name}* en Curuguaty. 🚗⚡\n\n` +
      `Queríamos consultar cómo está funcionando su vehículo *${order.vehicle.brand} ${order.vehicle.model}* tras el servicio realizado en nuestro taller.\n\n` +
      `🎁 Como cliente preferencial, tiene derecho a una *Revisión Preventiva Gratuita* de carga de batería y alternador.\n\n` +
      `Puede pasar por nuestro taller cuando guste sin ningún costo. ¡A las órdenes!`;

    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const deliveredOrders = orders.filter(o => o.status === 'concluido' || o.status === 'entregue');

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-y-auto space-y-4">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-red-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <HeartHandshake className="w-4 h-4" /> Fidelización & Posventa
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-white">
            Agendamiento de Turnos & Posventa por WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 max-w-xl">
            Coordine turnos para el taller y envíe seguimiento a clientes para mantener el flujo constante de trabajo.
          </p>
        </div>

        <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800 text-center shrink-0">
          <span className="text-[10px] text-neutral-400 block">Clientes Atendidos</span>
          <span className="text-xl sm:text-2xl font-black text-red-500 font-mono">{deliveredOrders.length}</span>
          <span className="text-[10px] text-neutral-500 block">listos para posventa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Appointment Form */}
        <div className="p-4 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Calendar className="w-4 h-4 text-red-500" />
            <span>Nuevo Agendamiento por WhatsApp</span>
          </div>

          <form onSubmit={handleSendAppointmentWhatsApp} className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 text-xs">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 text-xs">WhatsApp (+595...) *</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="+595 98..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs font-mono focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1 text-xs">Vehículo / Placa</label>
              <input
                type="text"
                value={vehicle}
                onChange={e => setVehicle(e.target.value)}
                placeholder="Ej: Toyota Hilux (CAN-789)"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1 text-xs">Servicio a Realizar</label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:border-red-500 font-medium"
              >
                <option value="Aire Acondicionado en General">❄️ Aire Acondicionado en General (Carga de gas, compresor)</option>
                <option value="Programación de Caja Automática en General">⚙️ Programación de Caja Automática en General</option>
                <option value="Programación de Llaves Codificadas">🔑 Programación de Llaves Codificadas</option>
                <option value="Copia de Llaves Tipo Navaja en General">🗝️ Copia de Llaves Tipo Navaja en General</option>
                <option value="Reprogramación de CPU / Módulo">💻 Reprogramación de CPU / Módulo (ECU)</option>
                <option value="Servicios de Eléctrica General Automotriz y Agrícola">⚡ Eléctrica General Automotriz y Agrícola (Tractores)</option>
                <option value="Venta y Cambio de Batería con Garantía">🔋 Venta y Cambio de Batería con Garantía</option>
                <option value="Limpieza e Inyección en Gasolina y Diésel">⛽ Limpieza e Inyección en Gasolina y Diésel</option>
                <option value="Mantenimiento General: Cambio de Aceite y Suspensión">🛠️ Cambio de Aceite y Suspensiones</option>
                <option value="Mecánica en General (Autos y Camionetas)">🚗 Mecánica en General (Autos y Camionetas)</option>
                <option value="Parte Eléctrica en Camiones Pesados">🚛 Parte Eléctrica en Camiones Pesados (24V)</option>
                <option value="Reprogramación de Pedal (Diésel y Nafta)">⚡ Reprogramación de Pedal Acelerador</option>
                <option value="Tienda de Repuestos y Balcão">📦 Tienda de Repuestos y Accesorios</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 text-xs">Fecha del Turno</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 text-xs">Hora Prevista</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={e => setAppointmentTime(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar Confirmación de Turno por WhatsApp
            </button>
          </form>
        </div>

        {/* RIGHT: After-Sales Loyalty List */}
        <div className="p-4 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 shadow-xl flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Posventa: Retorno & Satisfacción</span>
            </div>
            <span className="text-[10px] text-neutral-400">1-Clic WhatsApp</span>
          </div>

          <p className="text-xs text-neutral-400">
            Envíe mensajes de seguimiento para ofrecer chequeos preventivos gratuitos de batería y alternador en Curuguaty.
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px]">
            {deliveredOrders.length > 0 ? (
              deliveredOrders.map(order => (
                <div
                  key={order.id}
                  className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-2.5 hover:border-neutral-700 transition text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold">{order.client.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Concluido</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      🚗 {order.vehicle.brand} {order.vehicle.model} • Placa: {order.vehicle.plate}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendAfterSaleCheckup(order)}
                    className="px-2.5 py-1.5 bg-neutral-800 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition shrink-0 group"
                    title="Enviar mensaje de posventa"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                    Enviar Posventa
                  </button>
                </div>
              ))
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-center p-3 text-neutral-500">
                <HeartHandshake className="w-8 h-8 mb-1 opacity-30 text-red-500" />
                <p className="text-xs">No hay trabajos concluidos aún</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
