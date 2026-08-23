export type OrderStatus =
  | 'RECEBIDO'
  | 'ANALISE'
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGAMENTO_CONFIRMADO'
  | 'PRODUCAO'
  | 'REVISAO'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface StatusConfig {
  key: OrderStatus;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  stepIndex: number; // For progression bar (excluding CANCELADO)
}

export interface OrderNote {
  id: string;
  timestamp: string;
  author: 'May (Artista)' | 'Sistema';
  text: string;
  isPublic: boolean; // Shown to customer in tracking page
}

export interface Order {
  id: string; // e.g. "MA-1047"
  customerName: string;
  contact: string;
  contactType?: 'instagram' | 'email' | 'whatsapp' | 'outro';
  artType: string;
  details: string;
  referenceLinks?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  price?: string;
  notes: OrderNote[];
  previewImageUrl?: string;
  adminNotes?: string;
}

export interface PricePackage {
  id: string;
  name: string;
  price: string;
  unit: string;
  features: string[];
  isHighlight?: boolean;
  tag?: string;
}

export interface SiteSettings {
  artistName: string;
  whatsappNumber: string; // e.g. "5511999999999"
  pixKey: string;
  adminPin: string;
  isCommissionsOpen: boolean;
  notificationEmail?: string;
  prices: PricePackage[];
}

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  RECEBIDO: {
    key: 'RECEBIDO',
    label: 'Pedido recebido',
    emoji: '📥',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Recebemos sua solicitação e os dados foram gravados com sucesso!',
    stepIndex: 1,
  },
  ANALISE: {
    key: 'ANALISE',
    label: 'Em análise',
    emoji: '🔍',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'A May está avaliando seus detalhes e preparando o orçamento/prazo.',
    stepIndex: 2,
  },
  AGUARDANDO_PAGAMENTO: {
    key: 'AGUARDANDO_PAGAMENTO',
    label: 'Aguardando pagamento',
    emoji: '💰',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Orçamento definido. Aguardando envio do comprovante Pix para iniciar.',
    stepIndex: 3,
  },
  PAGAMENTO_CONFIRMADO: {
    key: 'PAGAMENTO_CONFIRMADO',
    label: 'Pagamento confirmado',
    emoji: '💳',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Pagamento recebido! Seu desenho entrou oficialmente na fila de produção.',
    stepIndex: 4,
  },
  PRODUCAO: {
    key: 'PRODUCAO',
    label: 'Em produção',
    emoji: '🎨',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'A May está desenhando sua arte neste exato momento com muito carinho!',
    stepIndex: 5,
  },
  REVISAO: {
    key: 'REVISAO',
    label: 'Aguardando revisão',
    emoji: '👀',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Esboço ou prévia enviada! Aguardando seu feedback para ajustes.',
    stepIndex: 6,
  },
  FINALIZADO: {
    key: 'FINALIZADO',
    label: 'Finalizado',
    emoji: '✅',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    description: 'Arte concluída e entregue em alta resolução! Muito obrigado pela confiança!',
    stepIndex: 7,
  },
  CANCELADO: {
    key: 'CANCELADO',
    label: 'Cancelado',
    emoji: '❌',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Este pedido foi cancelado.',
    stepIndex: -1,
  },
};

export const ORDER_WORKFLOW_STEPS: OrderStatus[] = [
  'RECEBIDO',
  'ANALISE',
  'AGUARDANDO_PAGAMENTO',
  'PAGAMENTO_CONFIRMADO',
  'PRODUCAO',
  'REVISAO',
  'FINALIZADO',
];
