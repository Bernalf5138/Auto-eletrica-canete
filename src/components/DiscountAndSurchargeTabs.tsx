import React, { useState } from 'react';
import { Percent, TrendingUp, Tag, Plus, Minus } from 'lucide-react';
import { formatGs } from '../utils/currency';

interface DiscountAndSurchargeTabsProps {
  subtotalGs: number;
  discountPercent: number;
  creditSurchargePercent: number;
  onChangeDiscount: (percent: number) => void;
  onChangeSurcharge: (percent: number) => void;
}

export const DiscountAndSurchargeTabs: React.FC<DiscountAndSurchargeTabsProps> = ({
  subtotalGs,
  discountPercent,
  creditSurchargePercent,
  onChangeDiscount,
  onChangeSurcharge
}) => {
  const [activeTab, setActiveTab] = useState<'descuento' | 'recargo'>('descuento');

  const discountAmountGs = (subtotalGs * discountPercent) / 100;
  const surchargeAmountGs = (subtotalGs * creditSurchargePercent) / 100;

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-2.5 sm:p-3 space-y-2.5">
      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('descuento')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'descuento'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Descuento (%)</span>
          {discountPercent > 0 && (
            <span className="bg-emerald-950 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-mono">
              -{discountPercent}%
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recargo')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'recargo'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Aumento Crédito (%)</span>
          {creditSurchargePercent > 0 && (
            <span className="bg-amber-950 text-amber-200 text-[10px] px-1.5 py-0.2 rounded font-mono">
              +{creditSurchargePercent}%
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Descuento (%) */}
      {activeTab === 'descuento' && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Porcentaje de Descuento:</span>
            {discountPercent > 0 && (
              <span className="text-emerald-400 font-mono font-bold">
                -{formatGs(discountAmountGs)}
              </span>
            )}
          </div>

          {/* Quick buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {[0, 5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => onChangeDiscount(pct)}
                className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                  discountPercent === pct
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850'
                }`}
              >
                {pct === 0 ? '0%' : `${pct}%`}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-neutral-500">Personalizado:</span>
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={discountPercent || ''}
                onChange={(e) => onChangeDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500"
              />
              <span className="absolute right-2 top-1 text-neutral-500 font-mono">%</span>
            </div>
            {discountPercent > 0 && (
              <button
                type="button"
                onClick={() => onChangeDiscount(0)}
                className="text-[10px] text-neutral-500 hover:text-red-400 px-1.5 py-1"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Recargo / Aumento Crédito (%) */}
      {activeTab === 'recargo' && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Recargo por Tarjeta / Crédito:</span>
            {creditSurchargePercent > 0 && (
              <span className="text-amber-400 font-mono font-bold">
                +{formatGs(surchargeAmountGs)}
              </span>
            )}
          </div>

          {/* Quick buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {[0, 5, 8, 10, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => onChangeSurcharge(pct)}
                className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                  creditSurchargePercent === pct
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850'
                }`}
              >
                {pct === 0 ? '0%' : `+${pct}%`}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-neutral-500">Personalizado:</span>
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={creditSurchargePercent || ''}
                onChange={(e) => onChangeSurcharge(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-amber-500"
              />
              <span className="absolute right-2 top-1 text-neutral-500 font-mono">%</span>
            </div>
            {creditSurchargePercent > 0 && (
              <button
                type="button"
                onClick={() => onChangeSurcharge(0)}
                className="text-[10px] text-neutral-500 hover:text-red-400 px-1.5 py-1"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
