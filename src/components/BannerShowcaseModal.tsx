import React, { useState } from 'react';
import { WorkshopSettings, WORKSHOP_OFFICIAL_SERVICES } from '../types';
import { 
  X, Download, Copy, Check, MessageCircle, Sparkles, Phone, 
  Award, Snowflake, Cpu, Key, Unlock, HardDrive, Zap, 
  BatteryCharging, Gauge, Wrench, Car, Truck, FastForward, Package
} from 'lucide-react';

interface BannerShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WorkshopSettings;
}

export const BannerShowcaseModal: React.FC<BannerShowcaseModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const marketingText = `🚗⚡ *${settings.name.toUpperCase()}* ⚡🚗
Especialistas em Elétrica Automotiva, Caminhões, Linha Agrícola & Eletrônica Avançada!

🔧 *NOSSOS SERVIÇOS COMPLETOS:*
❄️ *Ar Condicionado em Geral* (Carga de gás, compressores e reparos)
⚙️ *Programação de Caixa Automática em Geral*
🔑 *Programação de Chaves Codificadas*
🗝️ *Cópia de Chaves Canivete em Geral*
💻 *Reprogramação de CPU / Módulo (ECU)*
⚡ *Serviços de Elétrica Geral Automotiva e Agrícola* (Tratores e Colheitadeiras)
🔋 *Vendas de Baterias com Garantia!*
⛽ *Limpeza e Injeção em Veículos a Gasolina e Diesel*
🛠️ *Manutenção Geral: Troca de Óleo e Suspensões*
🚗 *Mecânica em Geral (Carros e Camionetes)*
🚛 *Parte Elétrica em Caminhões Pesados (24V)*
⚡ *Reprogramação de Pedal em Veículos Diesel e Gasolina*
📦 *Loja de Peças Gerais*

📲 *Fale conosco e agende pelo WhatsApp:*
👉 wa.me/${settings.whatsapp} (${settings.phone})
📍 *Atendimento com tecnologia de ponta e garantia comprovada!*`;

  const handleCopyMarketing = () => {
    navigator.clipboard.writeText(marketingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = (serviceTitle?: string) => {
    const text = serviceTitle 
      ? `Olá! Gostaria de um orçamento para o serviço de *${serviceTitle}* na ${settings.name}.`
      : `Olá! Gostaria de agendar um atendimento na ${settings.name}.`;
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'snowflake': return <Snowflake className="w-5 h-5 text-sky-400" />;
      case 'cpu': return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'key': return <Key className="w-5 h-5 text-amber-400" />;
      case 'unlock': return <Unlock className="w-5 h-5 text-yellow-400" />;
      case 'hard-drive': return <HardDrive className="w-5 h-5 text-cyan-400" />;
      case 'zap': return <Zap className="w-5 h-5 text-red-500" />;
      case 'battery-charging': return <BatteryCharging className="w-5 h-5 text-emerald-400" />;
      case 'gauge': return <Gauge className="w-5 h-5 text-orange-400" />;
      case 'wrench': return <Wrench className="w-5 h-5 text-neutral-300" />;
      case 'car': return <Car className="w-5 h-5 text-red-400" />;
      case 'truck': return <Truck className="w-5 h-5 text-blue-400" />;
      case 'fast-forward': return <FastForward className="w-5 h-5 text-emerald-400" />;
      case 'package': return <Package className="w-5 h-5 text-amber-400" />;
      default: return <Wrench className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500 animate-spin" />
            <h2 className="text-white font-bold text-base sm:text-lg">
              Banner Oficial & Catálogo de Serviços
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Banner Presentation */}
          <div className="relative rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl group">
            <img
              src="/banner.jpg"
              alt="Banner Oficial Auto Elétrica Cañete"
              className="w-full h-auto object-cover max-h-[420px]"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <a
                href="/banner.jpg"
                download="Banner_Oficial_Auto_Eletrica_Canete.jpg"
                className="px-3.5 py-2 bg-black/85 hover:bg-red-600 text-white rounded-xl text-xs font-bold backdrop-blur border border-white/10 flex items-center gap-1.5 transition shadow-lg"
              >
                <Download className="w-4 h-4" /> Baixar Banner HD
              </a>
            </div>
          </div>

          {/* Logo & Workshop Identification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-neutral-950 p-4 sm:p-6 rounded-2xl border border-neutral-800">
            <div className="flex flex-col items-center text-center">
              <img
                src="/logo.jpg"
                alt="Logo Auto Elétrica Cañete"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl border border-neutral-700 shadow-lg p-1 bg-neutral-900"
              />
              <a
                href="/logo.jpg"
                download="Logo_Auto_Eletrica_Canete.jpg"
                className="mt-2 text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Baixar Logo / Ícone
              </a>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 border border-red-800 text-red-400 text-xs font-bold">
                <Award className="w-3.5 h-3.5" /> Oficina Multimarcas, Caminhões & Agrícola
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {settings.name.toUpperCase()}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300">
                Atendimento completo em mecânica, injeção, ar-condicionado, chaves codificadas e módulos eletrônicos.
              </p>
              <div className="flex items-center gap-2 text-white font-mono text-xs sm:text-sm pt-1">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp de Atendimento: <strong className="text-emerald-400">{settings.phone}</strong></span>
              </div>
            </div>
          </div>

          {/* COMPLETE LIST OF 13 SERVICES GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-red-500">
                <Wrench className="w-4 h-4" /> Nossos 13 Serviços Especializados
              </h4>
              <span className="text-xs text-neutral-400 hidden sm:inline">
                Clique para enviar orçamento direto no WhatsApp
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {WORKSHOP_OFFICIAL_SERVICES.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => handleOpenWhatsApp(srv.title)}
                  className="p-3.5 bg-neutral-950 border border-neutral-800 hover:border-red-500/80 rounded-2xl flex flex-col justify-between cursor-pointer transition group hover:scale-[1.01] shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-neutral-900 rounded-xl group-hover:bg-red-950 transition">
                        {getServiceIcon(srv.iconName)}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 group-hover:underline">
                        <MessageCircle className="w-3 h-3" /> Orçar
                      </span>
                    </div>
                    <h5 className="text-white font-bold text-xs sm:text-sm group-hover:text-red-400 transition">
                      {srv.title}
                    </h5>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy-Ready Marketing Text for WhatsApp Status & Social Media */}
          <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider text-red-500">
                Texto Promocional Completo (Status do WhatsApp & Redes Sociais)
              </h4>
              <button
                onClick={handleCopyMarketing}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Texto Completo'}
              </button>
            </div>

            <pre className="p-3 bg-neutral-900 rounded-xl text-neutral-300 text-xs font-sans whitespace-pre-wrap leading-relaxed border border-neutral-800 max-h-48 overflow-y-auto">
              {marketingText}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleOpenWhatsApp()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Testar Envio no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
