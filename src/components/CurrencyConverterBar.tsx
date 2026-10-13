import React, { useState } from 'react';
import { CurrencyRates } from '../types';
import { ArrowLeftRight, Edit3, Check, DollarSign, X } from 'lucide-react';
import { formatGs, formatReal, formatDolar } from '../utils/currency';

interface CurrencyConverterBarProps {
  rates: CurrencyRates;
  onUpdateRates: (rates: CurrencyRates) => void;
}

export const CurrencyConverterBar: React.FC<CurrencyConverterBarProps> = ({
  rates,
  onUpdateRates
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempReal, setTempReal] = useState(rates.realToGs.toString());
  const [tempDolar, setTempDolar] = useState(rates.dolarToGs.toString());
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState<number>(100000);

  const handleSave = () => {
    const newRates: CurrencyRates = {
      realToGs: parseFloat(tempReal) || rates.realToGs,
      dolarToGs: parseFloat(tempDolar) || rates.dolarToGs
    };
    onUpdateRates(newRates);
    setIsEditing(false);
  };

  return (
    <div className="no-print bg-neutral-900/90 border-b border-neutral-800 px-2.5 sm:px-4 py-1.5 flex flex-wrap items-center justify-between text-xs gap-1.5">
      {/* Live Exchange Badges */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 flex items-center gap-1">
          <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
          <span className="hidden sm:inline">Cotización:</span>
        </span>

        {isEditing ? (
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-700 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-amber-400 font-bold text-[10px]">1 R$ =</span>
              <input
                type="number"
                value={tempReal}
                onChange={e => setTempReal(e.target.value)}
                className="w-16 bg-neutral-900 border border-neutral-700 text-white font-mono text-[11px] px-1 py-0.5 rounded"
              />
              <span className="text-[10px] text-neutral-400">Gs.</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold text-[10px]">1 US$ =</span>
              <input
                type="number"
                value={tempDolar}
                onChange={e => setTempDolar(e.target.value)}
                className="w-16 bg-neutral-900 border border-neutral-700 text-white font-mono text-[11px] px-1 py-0.5 rounded"
              />
              <span className="text-[10px] text-neutral-400">Gs.</span>
            </div>

            <button
              onClick={handleSave}
              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
              title="Guardar Cambio"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap font-mono text-[10px] sm:text-[11px]">
            <span className="bg-neutral-950 border border-neutral-800 px-1.5 sm:px-2 py-0.5 rounded text-neutral-200">
              🇵🇾 <strong className="text-white">Guaraní (₲)</strong>
            </span>
            <span className="bg-neutral-950 border border-amber-900/50 px-1.5 sm:px-2 py-0.5 rounded text-amber-300">
              🇧🇷 1 R$ = <strong className="text-white">{rates.realToGs.toLocaleString('es-PY')} Gs.</strong>
            </span>
            <span className="bg-neutral-950 border border-emerald-900/50 px-1.5 sm:px-2 py-0.5 rounded text-emerald-300">
              🇺🇸 1 US$ = <strong className="text-white">{rates.dolarToGs.toLocaleString('es-PY')} Gs.</strong>
            </span>
            <button
              onClick={() => {
                setTempReal(rates.realToGs.toString());
                setTempDolar(rates.dolarToGs.toString());
                setIsEditing(true);
              }}
              className="p-1 hover:text-white text-neutral-400 hover:bg-neutral-800 rounded transition"
              title="Cambiar cotización de la tienda"
            >
              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Converter Calculator Toggle */}
      <div>
        <button
          onClick={() => setShowCalculator(true)}
          className="text-[10px] sm:text-[11px] bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 transition shrink-0 active:scale-95"
        >
          <DollarSign className="w-3 h-3 text-emerald-400" />
          <span>Convertidor Rápido</span>
        </button>

        {/* Responsive Centered Modal for Mobile & Desktop */}
        {showCalculator && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
            onClick={() => setShowCalculator(false)}
          >
            <div 
              className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-3.5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center text-sm font-bold text-white border-b border-neutral-800 pb-2.5">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Conversor de 3 Monedas
                </span>
                <button 
                  onClick={() => setShowCalculator(false)} 
                  className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Monto a Convertir en Guaraníes:</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-500 font-mono text-xs">₲</span>
                  <input
                    type="number"
                    value={calcInput || ''}
                    onChange={e => setCalcInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-sm pl-7 pr-3 py-2 rounded-xl focus:border-red-500 focus:outline-none"
                    placeholder="Ej: 100000"
                    autoFocus
                  />
                </div>
              </div>

              {/* Converted values */}
              <div className="space-y-2 pt-1 font-mono text-xs">
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex justify-between items-center text-neutral-200">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">🇵🇾 Guaraní (₲ Base):</span>
                  <strong className="text-white text-sm">{formatGs(calcInput)}</strong>
                </div>

                <div className="p-2.5 bg-amber-950/40 border border-amber-900/60 rounded-xl flex justify-between items-center text-amber-300">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">🇧🇷 Real (R$):</span>
                  <strong className="text-amber-200 text-sm">{formatReal(calcInput, rates.realToGs)}</strong>
                </div>

                <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl flex justify-between items-center text-emerald-300">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">🇺🇸 Dólar (US$):</span>
                  <strong className="text-emerald-200 text-sm">{formatDolar(calcInput, rates.dolarToGs)}</strong>
                </div>
              </div>

              {/* Quick shortcut chips */}
              <div className="pt-1 flex gap-1.5">
                {[50000, 100000, 500000, 1000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCalcInput(val)}
                    className="flex-1 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[10px] font-mono text-neutral-300 hover:text-white"
                  >
                    {val >= 1000000 ? `${val/1000000}M` : `${val/1000}k`}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCalculator(false)}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
