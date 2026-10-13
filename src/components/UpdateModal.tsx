import React, { useState } from 'react';
import { Sparkles, Download, X, CheckCircle2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import type { UpdateInfo } from '../services/updaterService';

interface UpdateModalProps {
  updateInfo: UpdateInfo;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ updateInfo, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  const downloadTargetUrl =
    updateInfo.platform === 'android'
      ? updateInfo.apkUrl || updateInfo.exeUrl
      : updateInfo.exeUrl || updateInfo.apkUrl;

  const handleDismiss = () => {
    localStorage.setItem('dismissed_update_' + updateInfo.latestVersion, 'true');
    onClose();
  };

  const handleUpdateClick = () => {
    if (!downloadTargetUrl) {
      alert('Enlace de descarga no encontrado en la última versión.');
      return;
    }

    setDownloading(true);
    localStorage.setItem('dismissed_update_' + updateInfo.latestVersion, 'true');

    // 1. Tenta Capacitor Plugin Nativo
    const plugins = (Capacitor as any)?.Plugins;
    if (plugins?.NativeUpdater?.startUpdate) {
      plugins.NativeUpdater.startUpdate({ url: downloadTargetUrl });
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }

    // 2. Tenta Window JavascriptInterface
    if ((window as any).NativeUpdater?.startUpdate) {
      (window as any).NativeUpdater.startUpdate(downloadTargetUrl);
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }

    // 3. Fallback no PC / Navegador (download direto sem abrir aba em branco)
    const link = document.createElement('a');
    link.href = downloadTargetUrl;
    link.download = updateInfo.platform === 'android' ? 'Auto_Electrica_Canete.apk' : 'Auto_Electrica_Canete.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botão fechar */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Nueva Versión Disponible
            </h3>
            <p className="text-xs text-zinc-400">
              Auto Eléctrica Cañete Cloud Update
            </p>
          </div>
        </div>

        {/* Versões tag */}
        <div className="flex items-center gap-2 my-4 p-3 bg-zinc-800/80 rounded-xl border border-zinc-700/50">
          <span className="text-xs text-zinc-400">Instalada:</span>
          <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded">
            v{updateInfo.currentVersion}
          </span>
          <span className="text-zinc-500">➜</span>
          <span className="text-xs text-amber-400 font-bold">Disponible:</span>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded">
            v{updateInfo.latestVersion}
          </span>
        </div>

        {/* Notas da versão */}
        <div className="mb-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
            Novedades y Mejoras:
          </label>
          <div className="max-h-40 overflow-y-auto p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-300 whitespace-pre-line leading-relaxed font-sans">
            {updateInfo.releaseNotes || 'Mejoras de rendimiento, gestión de vehículos y estabilidad.'}
          </div>
        </div>

        {/* Aviso de preservação de dados */}
        <div className="flex items-center gap-2 mb-6 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Tus clientes, stock y registros se mantendrán intactos.</span>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleUpdateClick}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-[0.98] disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {downloading ? 'Descargando...' : 'Descargar e Instalar Ahora'}
          </button>

          <button
            onClick={handleDismiss}
            className="py-3 px-4 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold rounded-xl border border-zinc-700 transition"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
};
