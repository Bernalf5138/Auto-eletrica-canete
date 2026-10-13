import React, { useState, useEffect } from 'react';
import { Product, OrderOfService, Sale, Customer, WorkshopSettings, CurrencyRates } from './types';
import { storageService } from './services/storage';
import { PDVView } from './views/PDVView';
import { InventoryView } from './views/InventoryView';
import { OrdersView } from './views/OrdersView';
import { CustomersView } from './views/CustomersView';
import { AppointmentsAndAfterSalesView } from './views/AppointmentsAndAfterSalesView';
import { CurrencyConverterBar } from './components/CurrencyConverterBar';
import { BannerShowcaseModal } from './components/BannerShowcaseModal';
import { SettingsAndBackupModal } from './components/SettingsAndBackupModal';
import { UpdateModal } from './components/UpdateModal';
import { checkForUpdates, UpdateInfo } from './services/updaterService';
import { UPDATER_CONFIG } from './config/updater';
import { 
  ShoppingCart, Package, FileText, HeartHandshake, 
  Sparkles, Settings, Zap, Users, RefreshCw
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'pdv' | 'estoque' | 'os' | 'clientes' | 'pos_venda'>('pdv');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderOfService[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<WorkshopSettings>(storageService.getSettings());

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // Load data from LocalStorage
  const loadData = () => {
    setProducts(storageService.getProducts());
    setCustomers(storageService.getCustomers());
    setOrders(storageService.getOrders());
    setSales(storageService.getSales());
    setSettings(storageService.getSettings());
  };

  useEffect(() => {
    loadData();

    if (UPDATER_CONFIG.checkOnStartup) {
      const timer = setTimeout(() => {
        checkForUpdates().then((info) => {
          if (info.hasUpdate) {
            setUpdateInfo(info);
            setIsUpdateModalOpen(true);
          }
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleManualCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);
      if (info.hasUpdate) {
        setIsUpdateModalOpen(true);
      } else {
        alert(`¡Ya tienes la versión más reciente (v${UPDATER_CONFIG.currentVersion})!`);
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleUpdateRates = (newRates: CurrencyRates) => {
    const updatedSettings = { ...settings, rates: newRates };
    setSettings(updatedSettings);
    storageService.saveSettings(updatedSettings);
  };

  const handleCompleteSale = (newSale: Sale, updatedProducts: Product[]) => {
    const newSalesList = [newSale, ...sales];
    setSales(newSalesList);
    setProducts(updatedProducts);
    storageService.saveSales(newSalesList);
    storageService.saveProducts(updatedProducts);
  };

  const handleSaveProduct = (product: Product) => {
    let updated: Product[];
    const exists = products.some(p => p.id === product.id);
    if (exists) {
      updated = products.map(p => p.id === product.id ? product : p);
    } else {
      updated = [product, ...products];
    }
    setProducts(updated);
    storageService.saveProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    storageService.saveProducts(updated);
  };

  const handleSaveCustomer = (customer: Customer) => {
    let updated: Customer[];
    const exists = customers.some(c => c.id === customer.id);
    if (exists) {
      updated = customers.map(c => c.id === customer.id ? customer : c);
    } else {
      updated = [customer, ...customers];
    }
    setCustomers(updated);
    storageService.saveCustomers(updated);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updated = customers.filter(c => c.id !== customerId);
    setCustomers(updated);
    storageService.saveCustomers(updated);
  };

  const handleSaveOrder = (order: OrderOfService) => {
    let updated: OrderOfService[];
    const exists = orders.some(o => o.id === order.id);
    if (exists) {
      updated = orders.map(o => o.id === order.id ? order : o);
    } else {
      updated = [order, ...orders];
    }
    setOrders(updated);
    storageService.saveOrders(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    storageService.saveOrders(updated);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-4 lg:pb-0">
      {/* Top Navbar */}
      <header className="no-print h-14 sm:h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-2.5 sm:px-5 shrink-0 sticky top-0 z-30 shadow-lg">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <img
              src="./logo.jpg"
              alt="Logo Auto Eléctrica Cañete"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = './logo.png'; }}
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xl border border-neutral-700 bg-neutral-950 p-0.5 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-neutral-900 flex items-center justify-center">
              <Zap className="w-2 h-2 text-white" />
            </span>
          </div>

          <div>
            <h1 className="text-xs sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
              <span>{settings.name.toUpperCase()}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider hidden sm:inline">
                Curuguaty • {settings.landmark}
              </span>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-neutral-400 hover:text-emerald-400 font-mono flex items-center gap-1 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                {settings.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Desktop Tab Navigation (in Spanish) */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pdv')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'pdv'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            PDV Mostrador
          </button>

          <button
            onClick={() => setActiveTab('estoque')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'estoque'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventario & Autos
          </button>

          <button
            onClick={() => setActiveTab('os')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'os'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Presupuestos & OT
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'clientes'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Clientes & Deudores
          </button>

          <button
            onClick={() => setActiveTab('pos_venda')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'pos_venda'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Turnos & Posventa
          </button>
        </nav>

        {/* Top Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Banner Marketing Button */}
          <button
            onClick={() => setIsBannerModalOpen(true)}
            className="px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-red-950 transition"
            title="Ver Banner y Servicios"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Servicios</span>
          </button>

          {/* Cloud Update Check Button */}
          <button
            onClick={handleManualCheckUpdate}
            disabled={isCheckingUpdate}
            className={`p-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 rounded-xl transition ${
              updateInfo?.hasUpdate ? 'ring-2 ring-amber-500 text-amber-400 animate-pulse' : ''
            }`}
            title={`Verificar Actualizaciones Cloud (v${UPDATER_CONFIG.currentVersion})`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Settings & Currency */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 rounded-xl transition"
            title="Configuración y Monedas"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* CURRENCY CONVERTER BAR (Cotización del Día Gs. / R$ / US$) */}
      <CurrencyConverterBar
        rates={settings.rates}
        onUpdateRates={handleUpdateRates}
      />

      {/* Mobile Top Quick Tabs */}
      <div className="no-print lg:hidden bg-neutral-900/95 border-b border-neutral-800 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 shadow-inner">
        <button
          type="button"
          onClick={() => { setActiveTab('pdv'); if (navigator.vibrate) navigator.vibrate(25); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 ${
            activeTab === 'pdv' ? 'bg-red-600 text-white shadow-md shadow-red-950' : 'bg-neutral-850 text-neutral-300'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" /> PDV Mostrador
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('estoque'); if (navigator.vibrate) navigator.vibrate(25); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 ${
            activeTab === 'estoque' ? 'bg-red-600 text-white shadow-md shadow-red-950' : 'bg-neutral-850 text-neutral-300'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> Stock & Autos
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('os'); if (navigator.vibrate) navigator.vibrate(25); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 ${
            activeTab === 'os' ? 'bg-red-600 text-white shadow-md shadow-red-950' : 'bg-neutral-850 text-neutral-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Presupuestos
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('clientes'); if (navigator.vibrate) navigator.vibrate(25); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 ${
            activeTab === 'clientes' ? 'bg-red-600 text-white shadow-md shadow-red-950' : 'bg-neutral-850 text-neutral-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Clientes & Deudores
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('pos_venda'); if (navigator.vibrate) navigator.vibrate(25); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 ${
            activeTab === 'pos_venda' ? 'bg-red-600 text-white shadow-md shadow-red-950' : 'bg-neutral-850 text-neutral-300'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" /> Turnos
        </button>
        <button
          type="button"
          onClick={() => { setIsBannerModalOpen(true); if (navigator.vibrate) navigator.vibrate(25); }}
          className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 bg-neutral-850 text-amber-400 border border-amber-900/40"
        >
          <Sparkles className="w-3.5 h-3.5" /> Servicios Taller
        </button>
      </div>

      {/* Main Workspace View */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'pdv' && (
          <PDVView
            products={products}
            customers={customers}
            orders={orders}
            settings={settings}
            onCompleteSale={handleCompleteSale}
            onSaveOrder={handleSaveOrder}
            onSaveCustomer={handleSaveCustomer}
          />
        )}

        {activeTab === 'estoque' && (
          <InventoryView
            products={products}
            settings={settings}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'os' && (
          <OrdersView
            orders={orders}
            products={products}
            settings={settings}
            onSaveOrder={handleSaveOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeTab === 'clientes' && (
          <CustomersView
            customers={customers}
            settings={settings}
            products={products}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onSaveOrder={handleSaveOrder}
          />
        )}

        {activeTab === 'pos_venda' && (
          <AppointmentsAndAfterSalesView
            orders={orders}
            sales={sales}
            settings={settings}
          />
        )}
      </main>

      {/* Modals */}
      <BannerShowcaseModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        settings={settings}
      />

      <SettingsAndBackupModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onReloadAllData={loadData}
      />

      {isUpdateModalOpen && updateInfo && (
        <UpdateModal
          updateInfo={updateInfo}
          onClose={() => setIsUpdateModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
