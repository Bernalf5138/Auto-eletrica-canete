import React, { useState } from 'react';
import { Product, Sale, Customer, WorkshopSettings, OrderOfService, CustomerDebt } from '../types';
import { 
  ScanBarcode, ShoppingCart, Trash2, Plus, Minus, Search, 
  CheckCircle2, Printer, ArrowRight, Car, Users, Wrench, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { DiscountAndSurchargeTabs } from '../components/DiscountAndSurchargeTabs';
import { VehicleServiceModal } from '../components/VehicleServiceModal';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { formatGs, getAllCurrencies } from '../utils/currency';

interface PDVViewProps {
  products: Product[];
  customers: Customer[];
  settings: WorkshopSettings;
  orders?: OrderOfService[];
  onCompleteSale: (sale: Sale, updatedProducts: Product[]) => void;
  onSaveOrder?: (order: OrderOfService) => void;
  onSaveCustomer?: (customer: Customer) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const PDVView: React.FC<PDVViewProps> = ({
  products,
  customers,
  settings,
  orders = [],
  onCompleteSale,
  onSaveOrder,
  onSaveCustomer
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [creditSurchargePercent, setCreditSurchargePercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('efectivo');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [vehicleModalTarget, setVehicleModalTarget] = useState<{ customer: Customer; vehicle: Customer['registeredVehicles'][0] } | null>(null);

  // Global USB Barcode Scanner listener
  useBarcodeScanner((barcode) => {
    handleBarcodeScanned(barcode);
  });

  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
    } else {
      alert(`El repuesto con código ${barcode} no fue encontrado en el inventario.`);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      alert(`Atención: "${product.name}" no tiene existencias disponibles en el inventario.`);
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setCreditSurchargePercent(0);
    setClientName('');
    setClientPhone('');
  };

  // Calculations in Guaraníes
  const subtotalGs = cart.reduce((acc, item) => acc + (item.product.sellPriceGs * item.quantity), 0);
  const discountGs = Math.round((subtotalGs * discountPercent) / 100);
  const creditSurchargeGs = Math.round((subtotalGs * creditSurchargePercent) / 100);
  const totalGs = Math.max(0, subtotalGs - discountGs + creditSurchargeGs);

  const totalCurrencies = getAllCurrencies(totalGs, settings.rates);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const saleId = `VEN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSale: Sale = {
      id: saleId,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        quantity: item.quantity,
        unitPriceGs: item.product.sellPriceGs,
        totalGs: item.product.sellPriceGs * item.quantity
      })),
      subtotalGs,
      discountPercent,
      discountGs,
      creditSurchargePercent,
      creditSurchargeGs,
      totalGs,
      paymentMethod,
      clientName: clientName.trim() || 'Cliente Mostrador',
      clientPhone: clientPhone.trim() || '',
      createdAt: new Date().toISOString()
    };

    // Decrement stock quantities
    const updatedProducts = products.map(prod => {
      const cartItem = cart.find(ci => ci.product.id === prod.id);
      if (cartItem) {
        return {
          ...prod,
          stockQuantity: Math.max(0, prod.stockQuantity - cartItem.quantity)
        };
      }
      return prod;
    });

    onCompleteSale(newSale, updatedProducts);
    setCompletedSale(newSale);
    clearCart();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Unified Search: Piezas, Clientes, Vehículos y Placas (Chapas)
  const searchQ = searchQuery.toLowerCase().trim();

  // 1. Clientes y sus Vehículos/Placas encontrados
  const matchingCustomersAndVehicles: {
    customer: Customer;
    vehicle: Customer['registeredVehicles'][0];
    matchedBy: 'cliente' | 'vehiculo_placa';
  }[] = [];

  if (searchQ) {
    customers.forEach(c => {
      const nameMatch = c.name.toLowerCase().includes(searchQ);
      const phoneMatch = c.phone.includes(searchQ);
      const docMatch = c.document?.toLowerCase().includes(searchQ);
      
      const matchedVehicles = c.registeredVehicles.filter(v => 
        v.plate.toLowerCase().includes(searchQ) ||
        v.brand.toLowerCase().includes(searchQ) ||
        v.model.toLowerCase().includes(searchQ) ||
        v.year.toString().includes(searchQ)
      );

      if (nameMatch || phoneMatch || docMatch) {
        if (c.registeredVehicles.length > 0) {
          c.registeredVehicles.forEach(v => {
            matchingCustomersAndVehicles.push({ customer: c, vehicle: v, matchedBy: 'cliente' });
          });
        } else {
          matchingCustomersAndVehicles.push({
            customer: c,
            vehicle: { brand: 'Vehículo', model: 'General', year: 2024, plate: '' },
            matchedBy: 'cliente'
          });
        }
      } else if (matchedVehicles.length > 0) {
        matchedVehicles.forEach(v => {
          matchingCustomersAndVehicles.push({ customer: c, vehicle: v, matchedBy: 'vehiculo_placa' });
        });
      }
    });
  }

  // 2. Repuestos / Piezas (nombre, código de barras, o compatibilidad con vehículo)
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQ || 
      p.name.toLowerCase().includes(searchQ) ||
      p.barcode.includes(searchQ) ||
      p.compatibility.some(c => 
        c.brand.toLowerCase().includes(searchQ) ||
        c.model.toLowerCase().includes(searchQ) ||
        c.yearFrom.toString().includes(searchQ) ||
        c.yearTo.toString().includes(searchQ)
      );
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-2 sm:p-4 min-h-[calc(100vh-140px)] pb-4 lg:pb-4">
      {/* LEFT: Product Catalog & Search */}
      <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Search & Barcode Bar */}
        <div className="p-2.5 sm:p-3 bg-neutral-950 border-b border-neutral-800 flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar repuesto, cliente (Mendoza...), auto o chapa (ABC-123)..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-1.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="w-full sm:w-auto px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition shrink-0 active:scale-95"
            title="Escanear código con cámara o lector USB"
          >
            <ScanBarcode className="w-4 h-4" />
            Escanear
          </button>
        </div>

        {/* Unified Search Results: Clientes, Vehículos & Chapas Banner */}
        {searchQ.length > 0 && matchingCustomersAndVehicles.length > 0 && (
          <div className="p-2.5 sm:p-3 bg-red-950/40 border-b border-red-900/60 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-400" />
                Clientes, Vehículos y Placas Encontrados ({matchingCustomersAndVehicles.length}):
              </span>
              <span className="text-[10px] text-neutral-400 hidden sm:inline">
                Toque "Entrar al Auto" para cargar piezas o servicios
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
              {matchingCustomersAndVehicles.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-red-600/70 rounded-xl flex items-center justify-between gap-2 transition shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white text-xs font-bold truncate">{item.customer.name}</span>
                      {item.vehicle.plate && (
                        <span className="bg-neutral-950 border border-neutral-700 text-amber-400 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                          CHAPA: {item.vehicle.plate}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                      🚗 {item.vehicle.brand} {item.vehicle.model} ({item.vehicle.year}) • 📞 {item.customer.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setVehicleModalTarget({ customer: item.customer, vehicle: item.vehicle })}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition shadow active:scale-95"
                      title="Entrar en el auto y agregar piezas o servicios"
                    >
                      <Wrench className="w-3 h-3" /> Entrar al Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClientName(item.customer.name);
                        setClientPhone(item.customer.phone);
                        if (navigator.vibrate) navigator.vibrate(25);
                      }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[11px] font-semibold transition"
                      title="Usar cliente en la venta actual"
                    >
                      Venta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Bar */}
        <div className="px-2.5 py-1.5 bg-neutral-950/60 border-b border-neutral-800 flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'bateria', label: '🔋 Baterías' },
            { id: 'alternador', label: '⚡ Alternadores' },
            { id: 'partida', label: '🚗 Arranques' },
            { id: 'ar_condicionado', label: '❄️ Aire Acond.' },
            { id: 'chaves_modulos', label: '🔑 Llaves/Módulos' },
            { id: 'pesada_agricola', label: '🚜 Pesado/Agrícola' },
            { id: 'iluminacao', label: '💡 Luces/LED' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition text-[11px] ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-neutral-850 text-neutral-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredProducts.map(prod => (
            <div
              key={prod.id}
              onClick={() => addToCart(prod)}
              className="bg-neutral-950 border border-neutral-800 hover:border-red-500/80 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer transition hover:scale-[1.01] shadow-sm group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900 mb-1.5">
                <img
                  src={prod.image || './logo.jpg'}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <span className={`absolute top-1 right-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  prod.stockQuantity > 0 ? 'bg-black/70 text-emerald-400' : 'bg-red-900 text-red-200'
                }`}>
                  Stock: {prod.stockQuantity}
                </span>
              </div>

              <div>
                <h4 className="text-white font-semibold text-xs line-clamp-2 leading-snug group-hover:text-red-400 transition">
                  {prod.name}
                </h4>
                {prod.compatibility[0] && (
                  <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                    🚗 {prod.compatibility[0].brand} {prod.compatibility[0].model}
                  </p>
                )}
              </div>

              <div className="mt-2 pt-1.5 border-t border-neutral-850 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black font-mono text-red-500">
                  {formatGs(prod.sellPriceGs)}
                </span>
                <span className="p-1 bg-neutral-800 group-hover:bg-red-600 text-white rounded-lg transition">
                  <Plus className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Cart & Checkout Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl shrink-0">
        <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <ShoppingCart className="w-4 h-4 text-red-500" />
            <span>Carrito del Mostrador</span>
            <span className="bg-red-950 border border-red-800 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {cart.reduce((a, b) => a + b.quantity, 0)} ítems
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] text-neutral-400 hover:text-red-400 transition"
            >
              Vaciar
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 max-h-[160px] lg:max-h-none">
          {cart.length > 0 ? (
            cart.map(item => (
              <div
                key={item.product.id}
                className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-1.5"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="text-white text-xs font-semibold truncate">{item.product.name}</h5>
                  <p className="text-[11px] font-mono text-red-400">
                    {formatGs(item.product.sellPriceGs)} x {item.quantity} = {formatGs(item.product.sellPriceGs * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-white px-1">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-28 flex flex-col items-center justify-center text-center p-3 text-neutral-500">
              <ShoppingCart className="w-7 h-7 mb-1 opacity-30 text-red-500" />
              <p className="text-xs">Carrito vacío</p>
              <p className="text-[10px] text-neutral-600">Seleccione repuestos al lado o escanee con el lector</p>
            </div>
          )}
        </div>

        {/* Controls, Discounts, Surcharges & Checkout */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 space-y-2.5 text-xs">
          {/* Customer Selection / Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Cliente (Opcional)"
              list="customer-suggestions"
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500"
            />
            <datalist id="customer-suggestions">
              {customers.map(c => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>

            <input
              type="text"
              value={clientPhone}
              onChange={e => setClientPhone(e.target.value)}
              placeholder="WhatsApp (+595...)"
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 font-mono"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Forma de Pago:</label>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              {[
                { id: 'efectivo', label: '💵 Efectivo' },
                { id: 'tarjeta_credito', label: '💳 Crédito' },
                { id: 'tarjeta_debito', label: '💳 Débito' },
                { id: 'pix', label: '⚡ Pix / Transf.' },
                { id: 'transferencia', label: '🏦 Bancaria' },
                { id: 'credito_plazo', label: '📋 A Plazo / Fiado' }
              ].map(pm => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id as Sale['paymentMethod'])}
                  className={`py-1 px-1 rounded-lg font-medium text-center transition truncate ${
                    paymentMethod === pm.id
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* DEDICATED DISCOUNT % & CREDIT SURCHARGE % TABS */}
          <DiscountAndSurchargeTabs
            subtotalGs={subtotalGs}
            discountPercent={discountPercent}
            creditSurchargePercent={creditSurchargePercent}
            onChangeDiscount={setDiscountPercent}
            onChangeSurcharge={setCreditSurchargePercent}
          />

          {/* Totals Summary in 3 Currencies */}
          <div className="pt-2 border-t border-neutral-800 space-y-1 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span className="text-white">{formatGs(subtotalGs)}</span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Descuento (-{discountPercent}%):</span>
                <span>-{formatGs(discountGs)}</span>
              </div>
            )}

            {creditSurchargePercent > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Recargo Crédito (+{creditSurchargePercent}%):</span>
                <span>+{formatGs(creditSurchargeGs)}</span>
              </div>
            )}

            {/* Main Total in Guaraníes */}
            <div className="pt-1.5 border-t border-neutral-800 flex justify-between items-center text-sm font-black text-white">
              <span className="font-sans">TOTAL A PAGAR:</span>
              <span className="text-red-500 text-base">{totalCurrencies.gs}</span>
            </div>

            {/* Simultaneous Conversion in Reales and Dólares */}
            <div className="flex justify-between text-[11px] pt-0.5">
              <span className="text-amber-300">🇧🇷 {totalCurrencies.real}</span>
              <span className="text-emerald-300">🇺🇸 {totalCurrencies.dolar}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-red-950 transition active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalizar Venta (F2)
          </button>
        </div>
      </div>

      {/* Barcode Camera Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onScan={handleBarcodeScanned}
        title="Escanear Repuesto para Carrito"
      />

      {/* Completed Sale Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-5 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-white font-bold text-base">¡Venta Concluida con Éxito!</h3>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono space-y-1">
              <div className="text-neutral-400">Comprobante: {completedSale.id}</div>
              <div className="text-red-500 font-bold text-base">
                {formatGs(completedSale.totalGs)}
              </div>
              <div className="text-[11px] text-neutral-400">
                Pago: {completedSale.paymentMethod.toUpperCase()}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Service Modal */}
      {vehicleModalTarget && (
        <VehicleServiceModal
          isOpen={Boolean(vehicleModalTarget)}
          onClose={() => setVehicleModalTarget(null)}
          customer={vehicleModalTarget.customer}
          vehicle={vehicleModalTarget.vehicle}
          products={products}
          settings={settings}
          onSaveAsOrder={order => {
            if (onSaveOrder) onSaveOrder(order);
          }}
          onAddDebtToCustomer={(customerId, amountGs, desc) => {
            if (onSaveCustomer) {
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
            }
          }}
          onTransferToPDV={(cName, cPhone, items) => {
            setClientName(cName);
            setClientPhone(cPhone);
            items.forEach(it => {
              addToCart(it.product);
            });
            setVehicleModalTarget(null);
          }}
        />
      )}
    </div>
  );
};
