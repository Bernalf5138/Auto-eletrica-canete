export interface VehicleCompatibility {
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number | string; // Ej: 2018 o 'Actual'
  engine?: string;
}

export type ProductCategory = 
  | 'bateria' 
  | 'alternador' 
  | 'partida' 
  | 'ar_condicionado'
  | 'chaves_modulos'
  | 'injecao_diesel_gas'
  | 'pesada_agricola'
  | 'oleo_suspensao'
  | 'iluminacao' 
  | 'rele_fusivel' 
  | 'pecas_gerais';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  barcode: string;
  image: string; // Base64 o URL
  compatibility: VehicleCompatibility[];
  costPriceGs: number; // Precio de costo en Guaraníes
  sellPriceGs: number; // Precio de venta en Guaraníes (Moneda base)
  stockQuantity: number;
  minStock: number;
  unit: 'un' | 'kit' | 'par' | 'metro' | 'litro';
  location: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPriceGs: number;
  totalGs: number;
  type: 'peca' | 'mao_de_obra';
}

export type OSStatus = 
  | 'orcamento' 
  | 'aprovado' 
  | 'em_andamento' 
  | 'aguardando_peca' 
  | 'concluido' 
  | 'entregue' 
  | 'cancelado';

export interface ElectricalDiagnosis {
  batteryTested: boolean;
  batteryVoltageRest?: number; // Ej: 12.6V
  batteryVoltageCranking?: number; // Ej: 10.2V
  alternatorChargingVoltage?: number; // Ej: 14.2V
  starterCondition?: 'Excelente' | 'Escobillas Gastadas' | 'Inducido Dañado' | 'Bendix Patinando' | 'Pesado';
  parasiticDrainMa?: number; // Ej: 25mA
  diagnosisNotes?: string;
}

export interface OrderOfService {
  id: string;
  type: 'presupuesto' | 'ordem_servico';
  client: {
    name: string;
    phone: string;
    document?: string;
    address?: string;
  };
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    year: number;
    color?: string;
    km: number;
    chassi?: string;
  };
  reportedProblem: string;
  diagnosis: ElectricalDiagnosis;
  items: ServiceItem[];
  totalPartsGs: number;
  totalLaborGs: number;
  discountPercent: number; // Descuento en %
  discountGs: number;      // Descuento en Guaraníes
  creditSurchargePercent: number; // Recargo de Crédito en %
  creditSurchargeGs: number;      // Recargo en Guaraníes
  totalGs: number;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta_credito' | 'tarjeta_debito' | 'pix' | 'credito_plazo';
  status: OSStatus;
  validityDays: number;
  warranty: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  items: {
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    unitPriceGs: number;
    totalGs: number;
  }[];
  subtotalGs: number;
  discountPercent: number;
  discountGs: number;
  creditSurchargePercent: number;
  creditSurchargeGs: number;
  totalGs: number;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta_credito' | 'tarjeta_debito' | 'pix' | 'credito_plazo';
  clientName?: string;
  clientPhone?: string;
  createdAt: string;
}

export interface CustomerDebt {
  id: string;
  description: string;
  originalAmountGs: number;
  interestPercent: number; // % de recargo por mora
  interestAmountGs: number;
  totalDueGs: number;
  dueDate: string; // Fecha de vencimiento
  status: 'pendiente' | 'vencido' | 'pagado';
  paidAt?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  document: string; // C.I. o RUC
  address: string;
  city: string;
  registeredVehicles: {
    brand: string;
    model: string;
    year: number;
    plate: string;
  }[];
  debts: CustomerDebt[];
  notes?: string;
  createdAt: string;
}

export interface CurrencyRates {
  realToGs: number;  // 1 Real = X Guaraníes (Ej: 1.350)
  dolarToGs: number; // 1 Dólar = X Guaraníes (Ej: 7.500)
}

export interface WorkshopSettings {
  name: string;
  subtitle: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  landmark: string;
  logoUrl: string;
  bannerUrl: string;
  baseCurrency: 'Gs.';
  rates: CurrencyRates;
  defaultLateInterestPercent: number; // % estándar de interés por mora (ej: 5%)
  pixKey?: string;
  terms: string;
}

export interface WorkshopServiceDefinition {
  id: string;
  title: string;
  category: 'eletrica' | 'eletronica' | 'ar' | 'mecanica' | 'pesada_agricola';
  description: string;
  iconName: string;
}

export const WORKSHOP_OFFICIAL_SERVICES: WorkshopServiceDefinition[] = [
  {
    id: "s-ar",
    title: "Aire Acondicionado en General",
    category: "ar",
    description: "Carga de gas R134a, detección de fugas con luz UV, compresores, electroventilador, limpieza y parte eléctrica completa.",
    iconName: "snowflake"
  },
  {
    id: "s-cambio",
    title: "Programación de Caja Automática en General",
    category: "eletronica",
    description: "Diagnóstico computarizado de transmisión automática, reset de adaptaciones, aprendizaje de embrague y programación TCM.",
    iconName: "cpu"
  },
  {
    id: "s-chaves-prog",
    title: "Programación de Llaves Codificadas",
    category: "eletronica",
    description: "Codificación de transponder, emparejamiento con inmovilizador (IMMO) y programación de nuevas llaves con chip.",
    iconName: "key"
  },
  {
    id: "s-chaves-canivete",
    title: "Copia de Llaves Tipo Navaja en General",
    category: "eletronica",
    description: "Confección de llaves tipo navaja completas con telemando de alarma, corte computarizado y carcasas reforzadas.",
    iconName: "unlock"
  },
  {
    id: "s-modulo-cpu",
    title: "Reprogramación de CPU / Módulo (ECU)",
    category: "eletronica",
    description: "Reparación electrónica, clonación, reseteo, desinmovilización (decode), casamiento de módulos y reprogramación de computadoras.",
    iconName: "hard-drive"
  },
  {
    id: "s-eletrica-geral",
    title: "Servicios de Eléctrica General Automotriz y Agrícola",
    category: "eletrica",
    description: "Atención completa para autos, camionetas, tractores, cosechadoras e implementos agrícolas en general.",
    iconName: "zap"
  },
  {
    id: "s-baterias",
    title: "Venta de Baterías con Garantía Oficial",
    category: "eletrica",
    description: "Baterías de primera línea (Moura, Bosch, Heliar, ACDelco) con prueba computarizada de CCA y garantía real.",
    iconName: "battery-charging"
  },
  {
    id: "s-injecao",
    title: "Limpieza e Inyección en Vehículos a Gasolina y Diésel",
    category: "mecanica",
    description: "Limpieza ultrasónica de inyectores, sistemas Common Rail diésel, bombas de alta presión, sensores y calibración.",
    iconName: "gauge"
  },
  {
    id: "s-manutencao-oleo",
    title: "Mantenimiento General: Cambio de Aceite y Suspensiones",
    category: "mecanica",
    description: "Cambio de aceite de motor y filtros originales, revisión y cambio de amortiguadores, bujes, rótulas, frenos y tren delantero.",
    iconName: "wrench"
  },
  {
    id: "s-mecanica-geral",
    title: "Mecánica en General (Autos y Camionetas)",
    category: "mecanica",
    description: "Reparación integral de motores, correas de distribución, sistema de enfriamiento y mecánica pesada de pick-ups 4x4.",
    iconName: "car"
  },
  {
    id: "s-caminhoes-pesados",
    title: "Parte Eléctrica en Camiones Pesados (24V)",
    category: "pesada_agricola",
    description: "Instalación y reparación de sistemas de 24V, alternadores de alta potencia, motores de arranque pesados e iluminación de carretas.",
    iconName: "truck"
  },
  {
    id: "s-pedal-reprog",
    title: "Reprogramación de Pedal (Diésel y Nafta/Gasolina)",
    category: "eletronica",
    description: "Eliminación del retardo (delay) del acelerador electrónico, respuesta inmediata de aceleración y conducción deportiva.",
    iconName: "fast-forward"
  },
  {
    id: "s-loja-pecas",
    title: "Tienda de Repuestos y Accesorios Generales",
    category: "eletrica",
    description: "Venta en mostrador de relés, focos, lámparas LED, fusibles, cables, bobinas, bujías y componentes eléctricos.",
    iconName: "package"
  }
];
