import { Product, OrderOfService, Sale, Customer, WorkshopSettings } from '../types';

export const DEFAULT_SETTINGS: WorkshopSettings = {
  name: "Auto Eléctrica Cañete",
  subtitle: "Especialistas en Eléctrica Automotriz, Camiones, Agrícola y Electrónica",
  phone: "+595 983 788199",
  whatsapp: "595983788199",
  address: "Curuguaty, Canindeyú",
  city: "Curuguaty",
  landmark: "Al lado de la comisaría",
  logoUrl: "./logo.jpg",
  bannerUrl: "./banner.jpg",
  baseCurrency: "Gs.",
  rates: {
    realToGs: 1350,   // 1 Real = 1.350 Guaraníes
    dolarToGs: 7500   // 1 Dólar = 7.500 Guaraníes
  },
  defaultLateInterestPercent: 5, // 5% de recargo por mora mensual por defecto
  pixKey: "+595983788199",
  terms: "Garantía de 90 días en mano de obra y repuestos según fabricante. No cubre daños por sobretensión externa, manipulación indebida o accidentes."
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Batería Moura 60Ah M60GD (Borne Positivo Derecho)",
    category: "bateria",
    barcode: "7891234000101",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
    compatibility: [
      { brand: "Volkswagen", model: "Gol / Voyage / Saveiro G5/G6/G7", yearFrom: 2008, yearTo: "Actual", engine: "1.0 / 1.6 TotalFlex" },
      { brand: "Fiat", model: "Palio / Uno / Strada Fire", yearFrom: 2005, yearTo: 2021, engine: "1.0 / 1.4" },
      { brand: "Toyota", model: "Corolla / Allion / Premio", yearFrom: 2003, yearTo: 2018, engine: "1.5 / 1.8 / 2.0" }
    ],
    costPriceGs: 460000,
    sellPriceGs: 650000,
    stockQuantity: 16,
    minStock: 4,
    unit: "un",
    location: "Estante A1 - Baterías",
    supplier: "Moura Baterías Paraguay",
    notes: "CCA 460A - 2 años de garantía oficial",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "Alternador Bosch 90A 14V Reforzado",
    category: "alternador",
    barcode: "7891234000200",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
    compatibility: [
      { brand: "Volkswagen", model: "Gol / Fox / Polo", yearFrom: 2008, yearTo: 2017, engine: "1.6 EA111" },
      { brand: "Volkswagen", model: "Golf", yearFrom: 2008, yearTo: 2014, engine: "1.6" }
    ],
    costPriceGs: 840000,
    sellPriceGs: 1200000,
    stockQuantity: 5,
    minStock: 2,
    unit: "un",
    location: "Estante B2 - Alternadores",
    supplier: "Bosch Autopartes",
    notes: "Polea estriada 6PK con regulador electrónico integrado",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "Motor de Arranque Toyota Hilux 2.8 / 3.0 D4D",
    category: "partida",
    barcode: "7891234000309",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80",
    compatibility: [
      { brand: "Toyota", model: "Hilux / SW4 Fortuner", yearFrom: 2005, yearTo: 2022, engine: "3.0 D4D / 2.8 Turbo Diésel" },
      { brand: "Toyota", model: "Prado / Land Cruiser", yearFrom: 2004, yearTo: 2012, engine: "3.0 Diésel" }
    ],
    costPriceGs: 1050000,
    sellPriceGs: 1550000,
    stockQuantity: 4,
    minStock: 2,
    unit: "un",
    location: "Estante B4 - Línea Diésel / Camionetas",
    supplier: "Denso Repuestos",
    notes: "12V 2.2kW 10 dientes, arranque de alta potencia para diésel",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "Llave Navaja Completa con Chip y Telemando Toyota",
    category: "chaves_modulos",
    barcode: "7891234000410",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80",
    compatibility: [
      { brand: "Toyota", model: "Hilux / Corolla / Fortuner", yearFrom: 2006, yearTo: 2019, engine: "Todos" }
    ],
    costPriceGs: 180000,
    sellPriceGs: 350000,
    stockQuantity: 12,
    minStock: 3,
    unit: "un",
    location: "Vitrina de Llaves y Electrónica",
    supplier: "Distribuidora KeyPro",
    notes: "Incluye transponder ID4D/G y programación lista",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    name: "Garrafa de Gas Refrigerante R134a para Aire Acondicionado (13.6 kg)",
    category: "ar_condicionado",
    barcode: "7891234000511",
    image: "https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=600&q=80",
    compatibility: [
      { brand: "Universal", model: "Autos, Camionetas, Camiones y Tractores", yearFrom: 1995, yearTo: "Actual", engine: "Universal" }
    ],
    costPriceGs: 520000,
    sellPriceGs: 780000,
    stockQuantity: 8,
    minStock: 2,
    unit: "un",
    location: "Depósito de Aire Acondicionado",
    supplier: "Refrigeración Dupont",
    notes: "Gas ecológico de alta pureza para climatización automotriz",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    name: "Alternador Pesado 24V 80A para Camiones y Tractores Agrícolas",
    category: "pesada_agricola",
    barcode: "7891234000612",
    image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=600&q=80",
    compatibility: [
      { brand: "Scania / Volvo / Mercedes-Benz", model: "Camiones 24V y Tractores John Deere / Massey", yearFrom: 2000, yearTo: "Actual", engine: "Línea Pesada Diésel" }
    ],
    costPriceGs: 1400000,
    sellPriceGs: 1950000,
    stockQuantity: 3,
    minStock: 1,
    unit: "un",
    location: "Estante C1 - Pesados y Agrícola",
    supplier: "Bosch Heavy Duty",
    notes: "Circuito 24V con protección antipolvo para campo",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cli-1",
    name: "Juan Carlos Benítez",
    phone: "+595 983 123456",
    document: "3.456.789",
    address: "Curuguaty Centro - Barrio San Isidro",
    city: "Curuguaty",
    registeredVehicles: [
      { brand: "Toyota", model: "Hilux CD 4x4", year: 2018, plate: "CAN-789" }
    ],
    debts: [
      {
        id: "d-1",
        description: "Reparación de alternador y carga de gas (Factura 042)",
        originalAmountGs: 850000,
        interestPercent: 5,
        interestAmountGs: 42500,
        totalDueGs: 892500,
        dueDate: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0], // 15 días vencido
        status: "vencido",
        createdAt: new Date(Date.now() - 86400000 * 35).toISOString()
      }
    ],
    notes: "Cliente antiguo. Suele pagar a fin de mes.",
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: "cli-2",
    name: "Estancia San Jorge (Rodrigo Duarte)",
    phone: "+595 981 776655",
    document: "80012345-6",
    address: "Ruta 10 km 28, Zona Rural",
    city: "Curuguaty",
    registeredVehicles: [
      { brand: "John Deere", model: "Tractor 6110J", year: 2020, plate: "AGR-2024" },
      { brand: "Scania", model: "R440 Carreta", year: 2015, plate: "CAM-440" }
    ],
    debts: [],
    notes: "Cuenta corporativa / empresa agrícola. Pago puntual contra entrega.",
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString()
  },
  {
    id: "cli-3",
    name: "Marcos Aurelio Ferreira",
    phone: "+595 982 554433",
    document: "4.890.123",
    address: "Barrio Santa Librada",
    city: "Curuguaty",
    registeredVehicles: [
      { brand: "Volkswagen", model: "Gol G6 1.6", year: 2015, plate: "BRA-2026" }
    ],
    debts: [
      {
        id: "d-2",
        description: "Batería Moura 60Ah a plazo",
        originalAmountGs: 650000,
        interestPercent: 8,
        interestAmountGs: 52000,
        totalDueGs: 702000,
        dueDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 días vencido
        status: "vencido",
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
      }
    ],
    notes: "Pendiente de cobro con recargo de interés.",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  }
];

export const INITIAL_ORDERS: OrderOfService[] = [
  {
    id: "PRE-2026-001",
    type: "presupuesto",
    client: {
      name: "Juan Carlos Benítez",
      phone: "+595 983 123456",
      document: "3.456.789",
      address: "Curuguaty Centro"
    },
    vehicle: {
      plate: "CAN-789",
      brand: "Toyota",
      model: "Hilux CD 4x4",
      year: 2018,
      color: "Plata",
      km: 142000
    },
    reportedProblem: "Luz de batería encendida en el tablero y aire acondicionado dejó de enfriar",
    diagnosis: {
      batteryTested: true,
      batteryVoltageRest: 12.1,
      batteryVoltageCranking: 9.6,
      alternatorChargingVoltage: 12.3,
      starterCondition: "Excelente",
      parasiticDrainMa: 25,
      diagnosisNotes: "Alternador con placa rectificadora dañada y escobillas al límite. Compresor de aire con baja carga de gas R134a."
    },
    items: [
      { id: "i-1", description: "Reparación y Mantenimiento Completo de Alternador", quantity: 1, unitPriceGs: 350000, totalGs: 350000, type: "mao_de_obra" },
      { id: "i-2", description: "Regulador de Voltaje y Placa de Diodos Bosch", quantity: 1, unitPriceGs: 280000, totalGs: 280000, type: "peca" },
      { id: "i-3", description: "Carga de Gas R134a y Aceite Sintético de Compresor", quantity: 1, unitPriceGs: 250000, totalGs: 250000, type: "peca" }
    ],
    totalPartsGs: 530000,
    totalLaborGs: 350000,
    discountPercent: 3.4,
    discountGs: 30000,
    creditSurchargePercent: 0,
    creditSurchargeGs: 0,
    totalGs: 850000,
    paymentMethod: "efectivo",
    status: "orcamento",
    validityDays: 15,
    warranty: "90 días de garantía escrita en repuestos y mano de obra",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "OS-2026-002",
    type: "ordem_servico",
    client: {
      name: "Estancia San Jorge - Rodrigo Duarte",
      phone: "+595 981 776655",
      document: "4.112.334",
      address: "Zona Rural Curuguaty"
    },
    vehicle: {
      plate: "AGR-2024",
      brand: "John Deere",
      model: "Tractor 6110J",
      year: 2020,
      color: "Verde",
      km: 4500
    },
    reportedProblem: "Corte intermitente del sistema eléctrico y arranque pesado en el campo",
    diagnosis: {
      batteryTested: true,
      batteryVoltageRest: 11.8,
      batteryVoltageCranking: 8.9,
      alternatorChargingVoltage: 14.2,
      starterCondition: "Pesado",
      parasiticDrainMa: 15,
      diagnosisNotes: "Batería cumplió vida útil en ciclo de trabajo pesado. Motor de arranque con suciedad interna en bendix."
    },
    items: [
      { id: "i-1", description: "Batería Moura Heavy Duty 100Ah", quantity: 1, unitPriceGs: 950000, totalGs: 950000, type: "peca" },
      { id: "i-2", description: "Mantenimiento y limpieza de motor de arranque y borneado", quantity: 1, unitPriceGs: 250000, totalGs: 250000, type: "mao_de_obra" }
    ],
    totalPartsGs: 950000,
    totalLaborGs: 250000,
    discountPercent: 4.1,
    discountGs: 50000,
    creditSurchargePercent: 0,
    creditSurchargeGs: 0,
    totalGs: 1150000,
    paymentMethod: "transferencia",
    status: "concluido",
    validityDays: 15,
    warranty: "1 año de garantía en batería Moura y 90 días en mano de obra",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: "VEN-2026-001",
    items: [
      { productId: "prod-1", productName: "Batería Moura 60Ah M60GD", barcode: "7891234000101", quantity: 1, unitPriceGs: 650000, totalGs: 650000 }
    ],
    subtotalGs: 650000,
    discountPercent: 0,
    discountGs: 0,
    creditSurchargePercent: 0,
    creditSurchargeGs: 0,
    totalGs: 650000,
    paymentMethod: "efectivo",
    clientName: "Cliente Mostrador",
    clientPhone: "+595 983 998877",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const STORAGE_KEYS = {
  PRODUCTS: 'aec_products_v3',
  ORDERS: 'aec_orders_v3',
  SALES: 'aec_sales_v3',
  CUSTOMERS: 'aec_customers_v3',
  SETTINGS: 'aec_settings_v3'
};

export const storageService = {
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCustomers(): Customer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getOrders(): OrderOfService[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders(orders: OrderOfService[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SALES;
    }
  },

  saveSales(sales: Sale[]): void {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getSettings(): WorkshopSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed, 
        rates: { ...DEFAULT_SETTINGS.rates, ...(parsed.rates || {}) } 
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: WorkshopSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportBackup(): string {
    const backup = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      orders: this.getOrders(),
      sales: this.getSales(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) this.saveProducts(data.products);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.orders) this.saveOrders(data.orders);
      if (data.sales) this.saveSales(data.sales);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error("Error importando backup:", e);
      return false;
    }
  }
};
