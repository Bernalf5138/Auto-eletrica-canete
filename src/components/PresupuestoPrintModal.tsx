import React, { useState } from 'react';
import { OrderOfService, WorkshopSettings } from '../types';
import { X, Printer, Copy, Check, MessageCircle, FileText, Zap } from 'lucide-react';
import { getAllCurrencies, formatGs } from '../utils/currency';

interface PresupuestoPrintModalProps {
  order: OrderOfService | null;
  settings: WorkshopSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const PresupuestoPrintModal: React.FC<PresupuestoPrintModalProps> = ({
  order,
  settings,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const totals = getAllCurrencies(order.totalGs, settings.rates);
  const partsTotal = getAllCurrencies(order.totalPartsGs, settings.rates);
  const laborTotal = getAllCurrencies(order.totalLaborGs, settings.rates);

  const getWhatsAppMessage = () => {
    const isBudget = order.type === 'presupuesto';
    let text = `*${settings.name.toUpperCase()}*\n`;
    text += `📍 *Ubicación:* ${settings.address} (${settings.landmark})\n`;
    text += `*${isBudget ? 'PRESUPUESTO' : 'ORDEN DE TRABAJO'} Nº ${order.id}*\n\n`;
    text += `👤 *Cliente:* ${order.client.name}\n`;
    text += `🚗 *Vehículo:* ${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.year})\n`;
    text += `🔢 *Placa:* ${order.vehicle.plate} | *Km:* ${order.vehicle.km.toLocaleString('es-PY')} km\n\n`;
    text += `📋 *Problema Reportado:* ${order.reportedProblem}\n\n`;

    if (order.diagnosis.batteryTested || order.diagnosis.diagnosisNotes) {
      text += `⚡ *DIAGNÓSTICO ELÉCTRICO:*\n`;
      if (order.diagnosis.batteryVoltageRest) text += `• Batería (Reposo): ${order.diagnosis.batteryVoltageRest}V\n`;
      if (order.diagnosis.alternatorChargingVoltage) text += `• Carga Alternador: ${order.diagnosis.alternatorChargingVoltage}V\n`;
      if (order.diagnosis.starterCondition) text += `• Motor de Arranque: ${order.diagnosis.starterCondition}\n`;
      if (order.diagnosis.diagnosisNotes) text += `• Informe Técnico: ${order.diagnosis.diagnosisNotes}\n`;
      text += `\n`;
    }

    text += `🔧 *REPUESTOS & MANO DE OBRA:*\n`;
    order.items.forEach((item, index) => {
      text += `${index + 1}. ${item.description} (${item.quantity}x) = ${formatGs(item.totalGs)}\n`;
    });

    text += `\n💵 *Repuestos:* ${partsTotal.gs}`;
    text += `\n🛠️ *Mano de Obra:* ${laborTotal.gs}`;
    if (order.discountGs > 0) {
      text += `\n🏷️ *Descuento:* -${formatGs(order.discountGs)}`;
    }
    text += `\n\n💰 *TOTAL A PAGAR:*\n`;
    text += `🇵🇾 *${totals.gs}*\n`;
    text += `🇧🇷 *${totals.real}*\n`;
    text += `🇺🇸 *${totals.dolar}*\n\n`;
    text += `📅 *Validez del presupuesto:* ${order.validityDays} días\n`;
    text += `🛡️ *Garantía:* ${order.warranty}\n\n`;
    text += `📞 *Consultas y confirmación:* ${settings.phone}`;
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const rawPhone = order.client.phone.replace(/\D/g, '');
    const message = encodeURIComponent(getWhatsAppMessage());
    const url = rawPhone ? `https://wa.me/${rawPhone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const isBudget = order.type === 'presupuesto';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Actions Bar (No Print) */}
        <div className="no-print p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <FileText className="w-5 h-5 text-red-500" />
            <span>{isBudget ? 'Visualizar Presupuesto' : 'Visualizar Orden de Trabajo'}</span>
            <span className="text-xs bg-red-950 border border-red-700 text-red-400 px-2 py-0.5 rounded-full font-mono">
              {order.id}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-neutral-300" />
              Imprimir / PDF
            </button>
            <button
              onClick={handleCopyText}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-300" />}
              {copied ? '¡Copiado!' : 'Copiar Texto'}
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar por WhatsApp
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Area) */}
        <div className="print-container flex-1 overflow-y-auto p-4 sm:p-8 bg-white text-neutral-900 font-sans">
          {/* Header */}
          <div className="border-b-2 border-red-600 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="w-20 h-20 object-contain rounded-xl border border-neutral-300 p-1 shadow-sm shrink-0"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2 justify-center sm:justify-start">
                    {settings.name.toUpperCase()}
                  </h1>
                  <p className="text-xs sm:text-sm text-red-600 font-bold uppercase tracking-wide">
                    {settings.subtitle}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1 font-semibold">
                    📍 {settings.address} • <span className="text-red-700">{settings.landmark}</span>
                  </p>
                  <p className="text-xs font-bold text-neutral-800 mt-0.5">
                    📞 Contacto / WhatsApp: <span className="text-red-700 font-mono">{settings.phone}</span>
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right bg-neutral-100 p-3 sm:p-4 rounded-xl border border-neutral-200">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {isBudget ? 'PRESUPUESTO OFICIAL' : 'ORDEN DE TRABAJO'}
                </div>
                <div className="text-xl sm:text-2xl font-black text-red-600 font-mono">
                  {order.id}
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  Fecha: {new Date(order.createdAt).toLocaleDateString('es-PY')}
                </div>
                <div className="text-xs font-semibold text-neutral-700">
                  Validez: {order.validityDays} días
                </div>
              </div>
            </div>
          </div>

          {/* Client & Vehicle Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h2 className="text-xs font-bold uppercase text-red-600 tracking-wider mb-2 flex items-center gap-1.5">
                👤 DATOS DEL CLIENTE
              </h2>
              <div className="text-sm space-y-1">
                <div><span className="font-semibold text-neutral-700">Nombre:</span> <span className="font-bold">{order.client.name}</span></div>
                <div><span className="font-semibold text-neutral-700">Teléfono:</span> <span className="font-mono">{order.client.phone}</span></div>
                {order.client.document && <div><span className="font-semibold text-neutral-700">C.I. / RUC:</span> {order.client.document}</div>}
                {order.client.address && <div><span className="font-semibold text-neutral-700">Dirección:</span> {order.client.address}</div>}
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h2 className="text-xs font-bold uppercase text-red-600 tracking-wider mb-2 flex items-center gap-1.5">
                🚗 DATOS DEL VEHÍCULO
              </h2>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <div><span className="font-semibold text-neutral-700">Vehículo:</span> <span className="font-bold">{order.vehicle.brand} {order.vehicle.model}</span></div>
                  <div><span className="font-semibold text-neutral-700">Año:</span> {order.vehicle.year}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-neutral-700">Placa:</span>{' '}
                    <span className="bg-neutral-900 text-white font-mono font-bold px-2 py-0.5 rounded text-xs">
                      {order.vehicle.plate}
                    </span>
                  </div>
                  <div><span className="font-semibold text-neutral-700">Kilometraje:</span> {order.vehicle.km.toLocaleString('es-PY')} km</div>
                </div>
                {order.vehicle.color && <div><span className="font-semibold text-neutral-700">Color:</span> {order.vehicle.color}</div>}
              </div>
            </div>
          </div>

          {/* Reported Problem & Electrical Diagnostics */}
          <div className="mb-6 p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              SÍNTOMAS REPORTADOS Y DIAGNÓSTICO ELÉCTRICO
            </h2>
            <div className="text-xs sm:text-sm mb-3">
              <span className="font-semibold text-neutral-400">Reclamo del Cliente:</span>{' '}
              <span className="text-white font-medium">{order.reportedProblem}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800 text-xs">
              <div className="bg-neutral-800/80 p-2 rounded-lg">
                <span className="text-neutral-400 block text-[10px]">Batería (Reposo)</span>
                <span className="font-bold text-amber-300 font-mono">
                  {order.diagnosis.batteryVoltageRest ? `${order.diagnosis.batteryVoltageRest} V` : 'No medido'}
                </span>
              </div>
              <div className="bg-neutral-800/80 p-2 rounded-lg">
                <span className="text-neutral-400 block text-[10px]">Carga Alternador</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {order.diagnosis.alternatorChargingVoltage ? `${order.diagnosis.alternatorChargingVoltage} V` : 'No medido'}
                </span>
              </div>
              <div className="bg-neutral-800/80 p-2 rounded-lg">
                <span className="text-neutral-400 block text-[10px]">Motor de Arranque</span>
                <span className="font-bold text-sky-400">
                  {order.diagnosis.starterCondition || 'Verificado'}
                </span>
              </div>
              <div className="bg-neutral-800/80 p-2 rounded-lg">
                <span className="text-neutral-400 block text-[10px]">Fuga de Corriente</span>
                <span className="font-bold text-purple-300 font-mono">
                  {order.diagnosis.parasiticDrainMa ? `${order.diagnosis.parasiticDrainMa} mA` : 'Normal'}
                </span>
              </div>
            </div>

            {order.diagnosis.diagnosisNotes && (
              <div className="mt-3 text-xs text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <span className="font-semibold text-neutral-400">Informe Técnico:</span> {order.diagnosis.diagnosisNotes}
              </div>
            )}
          </div>

          {/* Items & Labor Table */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase text-neutral-700 tracking-wider mb-2">
              DETALLE DE REPUESTOS Y MANO DE OBRA
            </h2>
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Descripción / Repuesto</th>
                    <th className="py-2.5 px-3 text-center">Tipo</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Unitario (₲)</th>
                    <th className="py-2.5 px-3 text-right">Total (₲)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/80">
                      <td className="py-2 px-3 font-medium text-neutral-900">{item.description}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          item.type === 'peca' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.type === 'peca' ? 'Repuesto' : 'Mano de Obra'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-600">{formatGs(item.unitPriceGs)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatGs(item.totalGs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary with 3 Currencies */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div className="w-full sm:w-1/2 text-xs text-neutral-600 space-y-2">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-800 block mb-1">🛡️ TÉRMINOS Y GARANTÍA:</span>
                <p>{order.warranty}</p>
                <p className="mt-1 text-[11px] text-neutral-500">{settings.terms}</p>
              </div>
            </div>

            <div className="w-full sm:w-80 bg-neutral-100 p-4 rounded-xl border border-neutral-300 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal Repuestos:</span>
                <span className="font-mono">{partsTotal.gs}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal Mano de Obra:</span>
                <span className="font-mono">{laborTotal.gs}</span>
              </div>
              {order.discountGs > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento Otorgado:</span>
                  <span className="font-mono">-{formatGs(order.discountGs)}</span>
                </div>
              )}

              {/* Main Total in Guaraníes */}
              <div className="pt-2 border-t border-neutral-300 flex justify-between items-center text-base sm:text-lg font-black text-neutral-900">
                <span>TOTAL A PAGAR:</span>
                <span className="text-red-600 font-mono text-xl">{totals.gs}</span>
              </div>

              {/* Automatic Conversions in Reales and Dólares */}
              <div className="pt-2 border-t border-neutral-200 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded">
                  <span>🇧🇷 En Reales (R$):</span>
                  <span>{totals.real}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded">
                  <span>🇺🇸 En Dólares (US$):</span>
                  <span>{totals.dolar}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-300 text-center text-xs">
            <div>
              <div className="border-b border-neutral-400 w-3/4 mx-auto mb-2"></div>
              <div className="font-semibold text-neutral-800">{order.client.name}</div>
              <div className="text-neutral-500">Firma del Cliente</div>
            </div>
            <div>
              <div className="border-b border-neutral-400 w-3/4 mx-auto mb-2"></div>
              <div className="font-bold text-red-600">{settings.name.toUpperCase()}</div>
              <div className="text-neutral-500">Responsable Técnico / Taller</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
