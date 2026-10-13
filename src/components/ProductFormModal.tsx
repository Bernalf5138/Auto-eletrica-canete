import React, { useState, useEffect } from 'react';
import { Product, VehicleCompatibility, WorkshopSettings } from '../types';
import { X, Camera, ScanBarcode, Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { formatGs, formatReal, formatDolar } from '../utils/currency';

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  settings: WorkshopSettings;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  settings
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'bateria',
    barcode: '',
    image: '',
    compatibility: [
      { brand: 'Toyota', model: 'Hilux', yearFrom: 2005, yearTo: 'Actual', engine: 'Diésel' }
    ],
    costPriceGs: 0,
    sellPriceGs: 0,
    stockQuantity: 1,
    minStock: 2,
    unit: 'un',
    location: '',
    supplier: '',
    notes: ''
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else {
      setFormData({
        name: '',
        category: 'bateria',
        barcode: '',
        image: '',
        compatibility: [
          { brand: 'Toyota', model: 'Hilux', yearFrom: 2005, yearTo: 'Actual', engine: 'Diésel' }
        ],
        costPriceGs: 0,
        sellPriceGs: 0,
        stockQuantity: 1,
        minStock: 2,
        unit: 'un',
        location: '',
        supplier: '',
        notes: ''
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleGenerateBarcode = () => {
    const randomEan = '789' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setFormData(prev => ({ ...prev, barcode: randomEan }));
  };

  const handleAddCompatibility = () => {
    setFormData(prev => ({
      ...prev,
      compatibility: [
        ...(prev.compatibility || []),
        { brand: '', model: '', yearFrom: 2010, yearTo: 'Actual', engine: '' }
      ]
    }));
  };

  const handleRemoveCompatibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      compatibility: (prev.compatibility || []).filter((_, i) => i !== index)
    }));
  };

  const handleUpdateCompatibility = (index: number, field: keyof VehicleCompatibility, value: unknown) => {
    setFormData(prev => {
      const updated = [...(prev.compatibility || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, compatibility: updated };
    });
  };

  const calculateMargin = () => {
    const cost = Number(formData.costPriceGs) || 0;
    const sell = Number(formData.sellPriceGs) || 0;
    if (cost <= 0) return '0.0';
    return (((sell - cost) / cost) * 100).toFixed(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("Por favor, ingrese el nombre del repuesto.");
      return;
    }

    const newProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category || 'pecas_gerais',
      barcode: formData.barcode?.trim() || `GEN-${Date.now()}`,
      image: formData.image || './logo.jpg',
      compatibility: formData.compatibility || [],
      costPriceGs: Number(formData.costPriceGs) || 0,
      sellPriceGs: Number(formData.sellPriceGs) || 0,
      stockQuantity: Number(formData.stockQuantity) || 0,
      minStock: Number(formData.minStock) || 0,
      unit: formData.unit || 'un',
      location: formData.location || '',
      supplier: formData.supplier || '',
      notes: formData.notes || '',
      createdAt: product?.createdAt || new Date().toISOString()
    };

    onSave(newProduct);
    onClose();
  };

  const currentSellGs = Number(formData.sellPriceGs) || 0;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
          {/* Header */}
          <div className="p-3 sm:p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <h2 className="text-white font-bold text-sm sm:text-base">
                {product ? 'Editar Repuesto del Inventario' : 'Registrar Nuevo Repuesto'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
            {/* Top Grid: Image & Barcode & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Product Photo Box */}
              <div className="space-y-2">
                <label className="block text-neutral-300 font-semibold flex items-center justify-between text-xs">
                  <span>Foto del Repuesto</span>
                  <span className="text-[10px] text-red-400 font-normal">Cámara o Galería</span>
                </label>

                <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950 flex flex-col items-center justify-center overflow-hidden group">
                  {formData.image ? (
                    <>
                      <img
                        src={formData.image}
                        alt="Vista Previa"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                        <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                          title="Tomar nueva foto con cámara"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          className="p-2 bg-neutral-800 text-red-400 rounded-full hover:bg-neutral-700 transition"
                          title="Quitar foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-3 space-y-2">
                      <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto" />
                      <p className="text-neutral-500 text-[11px]">Sin foto</p>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 mx-auto transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Tomar Foto
                      </button>
                    </div>
                  )}
                </div>

                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full py-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Camera className="w-3 h-3 text-red-500" />
                    Cambiar Foto (Cámara / Celular)
                  </button>
                )}
              </div>

              {/* Product Info & Barcode */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1 text-xs">
                    Nombre del Repuesto / Descripción *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Batería Moura 60Ah o Alternador Bosch 90A"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1 text-xs">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as Product['category'] }))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:border-red-500"
                    >
                      <option value="bateria">🔋 Baterías Automotrices</option>
                      <option value="alternador">⚡ Alternadores & Reguladores</option>
                      <option value="partida">🚗 Motores de Arranque</option>
                      <option value="ar_condicionado">❄️ Aire Acondicionado (Gas, Partes)</option>
                      <option value="chaves_modulos">🔑 Llaves Codificadas & Módulos ECU</option>
                      <option value="injecao_diesel_gas">⛽ Inyección (Diésel & Gasolina)</option>
                      <option value="pesada_agricola">🚜 Línea Pesada & Agrícola</option>
                      <option value="oleo_suspensao">🛠️ Cambio de Aceite & Suspensión</option>
                      <option value="iluminacao">💡 Luces & Lámparas LED</option>
                      <option value="rele_fusivel">🔌 Relés, Fusibles & Diodos</option>
                      <option value="pecas_gerais">📦 Repuestos Generales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1 text-xs">Unidad</label>
                    <select
                      value={formData.unit}
                      onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value as Product['unit'] }))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:border-red-500"
                    >
                      <option value="un">Unidad (un)</option>
                      <option value="par">Par</option>
                      <option value="kit">Kit</option>
                      <option value="litro">Litro</option>
                      <option value="metro">Metro</option>
                    </select>
                  </div>
                </div>

                {/* Barcode scanner */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <label className="text-neutral-300 font-semibold">Código de Barras</label>
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3" /> Generar Código
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={e => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="Escanear con celular o digitar..."
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 font-mono text-white text-xs focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsBarcodeOpen(true)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs shadow-md shadow-red-950 transition shrink-0"
                      title="Escanear con cámara"
                    >
                      <ScanBarcode className="w-3.5 h-3.5" />
                      Escanear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">Ubicación / Estante</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Estante A1"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">Proveedor / Marca</label>
                    <input
                      type="text"
                      value={formData.supplier || ''}
                      onChange={e => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                      placeholder="Moura, Bosch"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* VEHICLE COMPATIBILITY (CARRO E ANO ESPECÍFICO) */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-xs flex items-center gap-1.5">
                    <span className="text-red-500">🚗</span>
                    Compatibilidad con Vehículos (Auto y Año)
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    Especifique a qué modelos y años sirve este repuesto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCompatibility}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3 text-red-500" /> Agregar Auto
                </button>
              </div>

              {formData.compatibility && formData.compatibility.length > 0 ? (
                <div className="space-y-1.5">
                  {formData.compatibility.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center text-xs"
                    >
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={comp.brand}
                          onChange={e => handleUpdateCompatibility(idx, 'brand', e.target.value)}
                          placeholder="Marca (Toyota, VW)"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={comp.model}
                          onChange={e => handleUpdateCompatibility(idx, 'model', e.target.value)}
                          placeholder="Modelo (Hilux, Gol)"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          value={comp.yearFrom}
                          onChange={e => handleUpdateCompatibility(idx, 'yearFrom', Number(e.target.value))}
                          placeholder="Desde (2008)"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={comp.yearTo}
                          onChange={e => handleUpdateCompatibility(idx, 'yearTo', e.target.value)}
                          placeholder="Hasta (2020 o Actual)"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveCompatibility(idx)}
                          className="p-1 text-neutral-500 hover:text-red-400 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Financials in Guaraníes with automatic conversion */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs">
              <div>
                <label className="block text-neutral-400 text-xs mb-1">Precio Costo (₲)</label>
                <input
                  type="number"
                  step="1000"
                  value={formData.costPriceGs || ''}
                  onChange={e => setFormData(prev => ({ ...prev, costPriceGs: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white font-mono focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-xs mb-1">Precio Venta (₲) *</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={formData.sellPriceGs || ''}
                  onChange={e => setFormData(prev => ({ ...prev, sellPriceGs: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold text-red-400 focus:border-red-500"
                />
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  {formatReal(currentSellGs, settings.rates.realToGs)} • {formatDolar(currentSellGs, settings.rates.dolarToGs)}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 text-xs mb-1">Margen de Ganancia</label>
                <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl px-2 py-1.5 text-emerald-400 font-mono font-bold text-center">
                  +{calculateMargin()}%
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 text-xs mb-1">Stock Actual</label>
                <input
                  type="number"
                  value={formData.stockQuantity || ''}
                  onChange={e => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white font-mono focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-xs mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  value={formData.minStock || ''}
                  onChange={e => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-amber-400 font-mono focus:border-red-500"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-semibold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-950 transition text-xs"
              >
                Guardar Repuesto
              </button>
            </div>
          </form>
        </div>
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => setFormData(prev => ({ ...prev, image: img }))}
        title="Fotografiar Repuesto para Inventario"
      />

      <BarcodeScannerModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        onScan={(code) => setFormData(prev => ({ ...prev, barcode: code }))}
        title="Escanear Código de Barras"
      />
    </>
  );
};
