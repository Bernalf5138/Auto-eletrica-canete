import React, { useState } from 'react';
import { Product, WorkshopSettings } from '../types';
import { 
  Package, Plus, Search, ScanBarcode, AlertTriangle, 
  Car, Edit3, Trash2, LayoutGrid, List
} from 'lucide-react';
import { ProductFormModal } from '../components/ProductFormModal';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { formatGs, getAllCurrencies } from '../utils/currency';

interface InventoryViewProps {
  products: Product[];
  settings: WorkshopSettings;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  settings,
  onSaveProduct,
  onDeleteProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [carFilter, setCarFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCar = !carFilter.trim() || p.compatibility.some(c => 
      c.brand.toLowerCase().includes(carFilter.toLowerCase()) ||
      c.model.toLowerCase().includes(carFilter.toLowerCase()) ||
      c.yearFrom.toString().includes(carFilter) ||
      c.yearTo.toString().includes(carFilter)
    );

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.stockQuantity <= p.minStock;

    return matchesSearch && matchesCar && matchesCategory && matchesLowStock;
  });

  // Calculate totals in Guaraníes
  const totalStockQty = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalStockCostGs = products.reduce((acc, p) => acc + (p.costPriceGs * p.stockQuantity), 0);
  const totalStockSellGs = products.reduce((acc, p) => acc + (p.sellPriceGs * p.stockQuantity), 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= p.minStock).length;

  const totalSellCurrencies = getAllCurrencies(totalStockSellGs, settings.rates);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleBarcodeScanned = (code: string) => {
    setSearchQuery(code);
    setIsBarcodeScannerOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden h-[calc(100vh-115px)] space-y-3 sm:space-y-4">
      {/* Top Inventory Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 shrink-0">
        <div className="p-2.5 sm:p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Total de Repuestos</span>
            <span className="text-lg sm:text-xl font-black text-white font-mono">{totalStockQty} un</span>
          </div>
          <div className="p-2.5 bg-red-950/60 border border-red-800/40 rounded-xl text-red-500">
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Valor Venta (₲)</span>
            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              {totalSellCurrencies.gs}
            </span>
            <div className="text-[10px] text-neutral-400 font-mono">
              🇧🇷 {totalSellCurrencies.real}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-emerald-500">
            <span className="text-xs font-bold font-mono">₲</span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Costo Invertido</span>
            <span className="text-base sm:text-lg font-black text-neutral-300 font-mono">
              {formatGs(totalStockCostGs)}
            </span>
          </div>
          <div className="p-2.5 bg-neutral-800 rounded-xl text-neutral-400">
            <span className="text-xs font-bold font-mono">Costo</span>
          </div>
        </div>

        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-2.5 sm:p-3 rounded-2xl flex items-center justify-between cursor-pointer transition border ${
            lowStockCount > 0
              ? 'bg-amber-950/40 border-amber-800/80 hover:bg-amber-950/60 text-amber-400'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
          }`}
          title="Filtrar repuestos con bajo stock"
        >
          <div>
            <span className="text-[11px] text-neutral-400 block">Stock Bajo</span>
            <span className="text-lg sm:text-xl font-black font-mono">
              {lowStockCount} alertas
            </span>
          </div>
          <div className="p-2.5 bg-amber-900/40 rounded-xl text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Filter & Action Header */}
      <div className="p-2.5 sm:p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row gap-2 items-stretch md:items-center justify-between shrink-0 shadow-lg">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar repuesto, código de barras..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="relative w-full sm:w-60">
            <Car className="w-4 h-4 absolute left-3 top-2.5 text-red-500" />
            <input
              type="text"
              value={carFilter}
              onChange={e => setCarFilter(e.target.value)}
              placeholder="Filtrar por Auto (Gol, Hilux 2018...)"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBarcodeScannerOpen(true)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-700"
            title="Escanear con cámara"
          >
            <ScanBarcode className="w-3.5 h-3.5 text-red-500" />
            Escanear
          </button>

          <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
              title="Vista en Tabla"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-950 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Repuesto
          </button>
        </div>
      </div>

      {/* Product Content: Grid Mode or Table Mode */}
      <div className="flex-1 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-2.5 sm:p-3 shadow-xl">
        {filteredProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const isLow = product.stockQuantity <= product.minStock;
                const priceCurrencies = getAllCurrencies(product.sellPriceGs, settings.rates);

                return (
                  <div
                    key={product.id}
                    className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden flex flex-col justify-between group transition shadow-md"
                  >
                    {/* Photo */}
                    <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={product.image || './logo.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="bg-black/80 backdrop-blur text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/10">
                          {product.barcode}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          isLow
                            ? 'bg-amber-600 text-black font-extrabold animate-pulse'
                            : 'bg-black/80 text-emerald-400'
                        }`}>
                          {product.stockQuantity} {product.unit}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-white font-bold text-xs sm:text-sm leading-snug">
                          {product.name}
                        </h4>

                        <div className="text-[11px] text-neutral-400 flex items-center justify-between mt-1">
                          <span>{product.location || 'Sin estante'}</span>
                          <span className="text-neutral-500">{product.supplier}</span>
                        </div>

                        {/* Vehicle Compatibility */}
                        <div className="mt-2 pt-1.5 border-t border-neutral-900">
                          <span className="text-[10px] uppercase font-bold text-red-400 block mb-1">
                            🚗 Autos Compatibles:
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-14 overflow-y-auto">
                            {product.compatibility.map((comp, idx) => (
                              <span
                                key={idx}
                                className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] px-1.5 py-0.5 rounded font-mono"
                              >
                                {comp.brand} {comp.model} ({comp.yearFrom}-{comp.yearTo})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pricing in 3 Currencies */}
                      <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Precio de Venta</span>
                          <span className="text-sm sm:text-base font-black font-mono text-red-500">
                            {priceCurrencies.gs}
                          </span>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {priceCurrencies.real} • {priceCurrencies.dolar}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl transition"
                            title="Editar repuesto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Desea eliminar "${product.name}" del inventario?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 bg-neutral-850 hover:bg-red-950 text-neutral-500 hover:text-red-400 rounded-xl transition"
                            title="Eliminar repuesto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-2">Foto</th>
                    <th className="py-2 px-2">Repuesto</th>
                    <th className="py-2 px-2">Código</th>
                    <th className="py-2 px-2">Autos Compatibles</th>
                    <th className="py-2 px-2 text-right">Costo (₲)</th>
                    <th className="py-2 px-2 text-right">Venta (₲)</th>
                    <th className="py-2 px-2 text-center">Stock</th>
                    <th className="py-2 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-950/60 transition">
                      <td className="py-1.5 px-2">
                        <img
                          src={p.image || './logo.jpg'}
                          alt={p.name}
                          className="w-9 h-9 object-cover rounded-lg border border-neutral-800"
                        />
                      </td>
                      <td className="py-1.5 px-2 font-semibold text-white">{p.name}</td>
                      <td className="py-1.5 px-2 font-mono text-neutral-400">{p.barcode}</td>
                      <td className="py-1.5 px-2 text-neutral-300 text-[11px]">
                        {p.compatibility.map(c => `${c.brand} ${c.model} (${c.yearFrom}-${c.yearTo})`).join(', ')}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-neutral-400">
                        {formatGs(p.costPriceGs)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-red-500">
                        {formatGs(p.sellPriceGs)}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          p.stockQuantity <= p.minStock ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'text-emerald-400'
                        }`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-right space-x-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1 text-neutral-400 hover:text-white rounded transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-neutral-500">
            <Package className="w-10 h-10 mb-1 opacity-30 text-red-500" />
            <h4 className="text-white font-bold text-xs">No se encontraron repuestos</h4>
            <p className="text-[11px] text-neutral-400">
              Pruebe cambiando los filtros de búsqueda o registre un nuevo repuesto.
            </p>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        product={editingProduct}
        onClose={() => setIsFormOpen(false)}
        onSave={onSaveProduct}
        settings={settings}
      />

      {/* Barcode Search Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title="Buscar Repuesto por Código de Barras"
      />
    </div>
  );
};
