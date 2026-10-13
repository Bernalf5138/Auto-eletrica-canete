import React, { useState } from 'react';
import { WorkshopSettings } from '../types';
import { X, Settings, Download, Upload, Save, Check, Sparkles, RefreshCw } from 'lucide-react';
import { storageService } from '../services/storage';
import { UPDATER_CONFIG } from '../config/updater';
import { checkForUpdates } from '../services/updaterService';
import { Capacitor } from '@capacitor/core';

interface SettingsAndBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WorkshopSettings;
  onUpdateSettings: (settings: WorkshopSettings) => void;
  onReloadAllData: () => void;
}

export const SettingsAndBackupModal: React.FC<SettingsAndBackupModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReloadAllData
}) => {
  const [formData, setFormData] = useState<WorkshopSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    storageService.saveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleExportBackup = () => {
    const json = storageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Auto_Electrica_Canete_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const success = storageService.importBackup(reader.result);
        if (success) {
          alert("¡Copia de seguridad restaurada con éxito!");
          onReloadAllData();
          onClose();
        } else {
          alert("Error al importar archivo de copia de seguridad. Formato no válido.");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Settings className="w-4 h-4 text-red-500" />
            <span>Configuración & Monedas del Taller</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider text-red-500">
              Datos Oficiales del Taller
            </h4>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1 text-xs">Nombre del Taller</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 text-xs">Ciudad / Departamento</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Curuguaty, Canindeyú"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 text-xs">Referencia de Ubicación</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={e => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                  placeholder="Al lado de la comisaría"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 text-xs">Teléfono Principal</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 text-xs">WhatsApp (Número sin +)</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="595983788199"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* CURRENCY RATES CONVERTER SETUP */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider block">
                Cotización de las 3 Monedas (Cambio del Taller):
              </span>
              <p className="text-[11px] text-neutral-400">
                La moneda base del taller es el <strong>Guaraní (₲)</strong>. Defina la cotización que aplica su taller para Reales y Dólares:
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-750">
                  <label className="block text-amber-300 font-bold text-xs mb-1">
                    🇧🇷 1 Real (R$) en Gs.:
                  </label>
                  <input
                    type="number"
                    value={formData.rates?.realToGs || 1350}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      rates: { ...prev.rates, realToGs: parseFloat(e.target.value) || 1350 }
                    }))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-xs"
                  />
                </div>

                <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-750">
                  <label className="block text-emerald-300 font-bold text-xs mb-1">
                    🇺🇸 1 Dólar (US$) en Gs.:
                  </label>
                  <input
                    type="number"
                    value={formData.rates?.dolarToGs || 7500}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      rates: { ...prev.rates, dolarToGs: parseFloat(e.target.value) || 7500 }
                    }))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Default late payment interest */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-1 text-xs">
                Tasa Estándar de Interés por Mora a Clientes Deudores (%)
              </label>
              <div className="relative w-40">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.defaultLateInterestPercent || 5}
                  onChange={e => setFormData(prev => ({ ...prev, defaultLateInterestPercent: parseFloat(e.target.value) || 5 }))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white font-mono font-bold text-xs"
                />
                <span className="absolute right-3 top-1.5 text-neutral-500 font-mono">%</span>
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1 text-xs">Términos de Garantía</label>
              <textarea
                rows={2}
                value={formData.terms}
                onChange={e => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-xs"
              />
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider text-red-500">
              Copia de Seguridad (Backup)
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Descargar Backup (.json)
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                Restaurar Backup
              </button>
            </div>
          </div>

          {/* Cloud Updates Section */}
          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Actualizaciones Cloud (GitHub)
              </h4>
              <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                v{UPDATER_CONFIG.currentVersion}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={checkingUpdate}
                onClick={async () => {
                  setCheckingUpdate(true);
                  setUpdateStatus(null);
                  try {
                    const res = await checkForUpdates();
                    if (res.hasUpdate) {
                      setUpdateStatus(`¡Nueva versión v${res.latestVersion} encontrada! Iniciando descarga...`);
                      const targetUrl = res.apkUrl || res.exeUrl;
                      const plugins = (Capacitor as any)?.Plugins;
                      if (plugins?.NativeUpdater?.startUpdate && targetUrl) {
                        plugins.NativeUpdater.startUpdate({ url: targetUrl });
                      } else if ((window as any).NativeUpdater?.startUpdate && targetUrl) {
                        (window as any).NativeUpdater.startUpdate(targetUrl);
                      } else if (targetUrl) {
                        const a = document.createElement('a');
                        a.href = targetUrl;
                        a.download = 'Auto_Electrica_Canete.apk';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    } else {
                      setUpdateStatus(`Tu aplicación está actualizada (v${UPDATER_CONFIG.currentVersion}).`);
                    }
                  } catch (e) {
                    setUpdateStatus('No se pudo conectar a la nube en este momento.');
                  } finally {
                    setCheckingUpdate(false);
                  }
                }}
                className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                {checkingUpdate ? 'Verificando...' : 'Buscar Actualización en la Nube'}
              </button>
            </div>
            {updateStatus && (
              <p className="text-[11px] text-amber-300 font-medium bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg">
                {updateStatus}
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-950 transition"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              {savedSuccess ? '¡Guardado!' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
