import { Order, OrderStatus, SiteSettings, STATUS_CONFIG } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  artistName: 'May',
  whatsappNumber: '5554981042011', // WhatsApp real da May (https://wa.me/5554981042011)
  pixKey: 'mayarts.desenhos@gmail.com',
  adminPin: '#May1shere',
  isCommissionsOpen: true,
  prices: [
    {
      id: 'icon',
      name: 'Icon',
      price: 'R$ 10,00',
      unit: '/ un',
      features: [
        'Rosto e ombros detalhados',
        'Ideal para Discord, Insta e perfis',
        'Fundo simples ou transparente',
        'Alta resolução (PNG)',
      ],
      tag: 'Econômico',
    },
    {
      id: 'chibi',
      name: 'Chibi',
      price: 'R$ 10,00',
      unit: '/ un',
      features: [
        'Estilo super fofinho e compacto',
        'Pose expressiva e personalizada',
        'Cores vibrantes e detalhes fofos',
        'Alta resolução (PNG)',
      ],
      isHighlight: true,
      tag: 'Mais Pedido ⭐',
    },
    {
      id: 'meio_corpo',
      name: 'Meio Corpo',
      price: 'R$ 15,00',
      unit: '/ un',
      features: [
        'Da cintura para cima',
        'Pose detalhada e vestuário',
        'Expressão marcante do personagem',
        'Alta resolução (PNG)',
      ],
      tag: 'Popular',
    },
    {
      id: 'corpo_todo',
      name: 'Corpo Todo',
      price: 'R$ 20,00',
      unit: '/ un',
      features: [
        'Personagem de corpo inteiro',
        'Pose dinâmica e roupas completas',
        'Detalhes ricos de cabelos e roupas',
        'Alta resolução (PNG)',
      ],
      tag: 'Completo',
    },
    {
      id: 'cenario',
      name: 'Cenário',
      price: 'R$ 25,00',
      unit: '/ un',
      features: [
        'Cenário detalhado e ambientação',
        'Iluminação, sombras e atmosfera',
        'Composição rica e personalizada',
        'Alta resolução (PNG)',
      ],
      tag: 'Especial',
    },
    {
      id: 'marca_dagua',
      name: 'Marca d’água',
      price: 'Sob consulta',
      unit: '',
      features: [
        'Assinatura visual única para sua marca',
        'PNG transparente em preto, branco e colorido',
        'Variações simplificadas em ícone ou selo',
        'Guia prático para usar no Canva ou CapCut',
      ],
      isHighlight: true,
      tag: 'Novo serviço',
    },
  ],
};

export const INITIAL_SAMPLE_ORDERS: Order[] = [];

const LOCAL_STORAGE_ORDERS_KEY = 'may_arts_orders_v2';
const LOCAL_STORAGE_SETTINGS_KEY = 'may_arts_settings_v3';

// Helper to safely get local storage
function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders to localStorage', err);
  }
}

function migrateStoredSettings(settings: SiteSettings): SiteSettings {
  const legacyPrices = ['R$ 1,00', 'R$ 1,50', 'R$ 3,50', 'R$ 5,00', 'R$ 6,50'];
  const storedPrices = settings.prices || [];
  const isLegacyPriceTable =
    storedPrices.length === legacyPrices.length &&
    storedPrices.every((pkg, index) => pkg.price === legacyPrices[index]);

  if (!isLegacyPriceTable) return settings;

  const migratedSettings = { ...settings, prices: INITIAL_SETTINGS.prices };
  localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(migratedSettings));
  return migratedSettings;
}

function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return migrateStoredSettings(JSON.parse(raw));
  } catch {
    return INITIAL_SETTINGS;
  }
}

function saveStoredSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage', err);
  }
}

// Generate unique ID in sequence: MA-1001, MA-1002... (garantindo ausência de duplicatas)
export function generateNextOrderId(existingOrders: Order[]): string {
  const numbers = existingOrders
    .map(o => {
      const match = (o.id || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(n => !isNaN(n) && n > 0);

  let nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1001;
  while (existingOrders.some(o => (o.id || '').toUpperCase() === `MA-${nextNum}`)) {
    nextNum++;
  }
  return `MA-${nextNum}`;
}

// Formats WhatsApp URL with nice aesthetic message
export function buildWhatsAppOrderUrl(whatsappNumber: string, order: Order): string {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.RECEBIDO;

  const text = `🌸 *NOVO PEDIDO - MAY ARTS* 🌸
-------------------------------------
🎨 *Código do Pedido:* #${order.id}
👤 *Cliente:* ${order.customerName}
📱 *Contato:* ${order.contact} (${order.contactType || 'geral'})
✨ *Tipo de Arte:* ${order.artType}

📝 *Detalhes:*
${order.details}

🔗 *Referências:*
${order.referenceLinks ? order.referenceLinks : 'Nenhuma referência enviada'}

📌 *Status Atual:* ${statusInfo.emoji} ${statusInfo.label}
-------------------------------------
🔍 *Acompanhe pelo site com o código:* #${order.id}
💬 _Mensagem gerada automaticamente pelo site da May Arts_`;

  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

export const apiService = {
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        saveStoredOrders(data);
        return data;
      }
    } catch {
      // Fallback
    }
    return getStoredOrders();
  },

  async getOrderById(id: string): Promise<Order | null> {
    const cleanId = id.trim().replace(/^#/, '').toUpperCase();
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const orders = getStoredOrders();
    const found = orders.find(o => o.id.toUpperCase() === cleanId || `#${o.id.toUpperCase()}` === cleanId);
    return found || null;
  },

  async createOrder(data: {
    customerName: string;
    contact: string;
    contactType?: 'instagram' | 'email' | 'whatsapp' | 'outro';
    artType: string;
    details: string;
    referenceLinks?: string;
  }): Promise<{ order: Order; whatsappUrl: string }> {
    const existing = getStoredOrders();
    const fallbackId = generateNextOrderId(existing);
    const now = new Date().toISOString();

    const orderPayload = {
      customerName: data.customerName.trim(),
      contact: data.contact.trim(),
      contactType: data.contactType || 'instagram',
      artType: data.artType,
      details: data.details.trim(),
      referenceLinks: data.referenceLinks?.trim() || '',
      status: 'RECEBIDO' as OrderStatus,
      createdAt: now,
      updatedAt: now,
      notes: [
        {
          id: `n-${Date.now()}`,
          timestamp: now,
          author: 'Sistema' as const,
          text: 'Pedido registrado com sucesso. Enviado para análise da May.',
          isPublic: true,
        },
      ],
    };

    let finalOrder: Order | null = null;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        finalOrder = await res.json();
      }
    } catch {
      // Network or offline fallback
    }

    if (!finalOrder) {
      finalOrder = {
        ...orderPayload,
        id: fallbackId,
      };
    }

    // Atualiza cache local garantindo que não há duplicatas de ID
    const currentList = getStoredOrders().filter(o => o.id.toUpperCase() !== finalOrder!.id.toUpperCase());
    saveStoredOrders([finalOrder, ...currentList]);

    const settings = getStoredSettings();
    const whatsappUrl = buildWhatsAppOrderUrl(settings.whatsappNumber, finalOrder);

    return { order: finalOrder, whatsappUrl };
  },

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    noteText?: string,
    estimatedDelivery?: string,
    price?: string
  ): Promise<Order | null> {
    const now = new Date().toISOString();
    const orders = getStoredOrders();
    const index = orders.findIndex(o => o.id.toUpperCase() === id.toUpperCase() || `#${o.id.toUpperCase()}` === id.toUpperCase());

    if (index === -1) return null;

    const current = orders[index];
    const statusCfg = STATUS_CONFIG[status];
    const updatedNotes = [...current.notes];

    if (noteText && noteText.trim()) {
      updatedNotes.push({
        id: `note-${Date.now()}`,
        timestamp: now,
        author: 'May (Artista)',
        text: noteText.trim(),
        isPublic: true,
      });
    } else {
      updatedNotes.push({
        id: `status-${Date.now()}`,
        timestamp: now,
        author: 'Sistema',
        text: `Status atualizado para: ${statusCfg.emoji} ${statusCfg.label}`,
        isPublic: true,
      });
    }

    const updatedOrder: Order = {
      ...current,
      status,
      updatedAt: now,
      estimatedDelivery: estimatedDelivery !== undefined ? estimatedDelivery : current.estimatedDelivery,
      price: price !== undefined ? price : current.price,
      notes: updatedNotes,
    };

    orders[index] = updatedOrder;
    saveStoredOrders(orders);

    try {
      await fetch(`/api/orders/${encodeURIComponent(updatedOrder.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          noteText,
          estimatedDelivery,
          price,
        }),
      });
    } catch {
      // Offline fallback
    }

    return updatedOrder;
  },

  async updateOrderDetails(id: string, updates: Partial<Order>): Promise<Order | null> {
    const orders = getStoredOrders();
    const index = orders.findIndex(o => o.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;

    const updated: Order = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    orders[index] = updated;
    saveStoredOrders(orders);

    try {
      await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {
      // Silent catch
    }

    return updated;
  },

  async deleteOrder(id: string): Promise<boolean> {
    const cleanId = (id || '').trim().replace(/^#/, '').toUpperCase();
    const orders = getStoredOrders();
    const filtered = orders.filter(o => (o.id || '').trim().replace(/^#/, '').toUpperCase() !== cleanId);
    saveStoredOrders(filtered);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanId)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      // Offline fallback
      return true;
    }
  },

  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        saveStoredSettings(data);
        return data;
      }
    } catch {
      // Fallback
    }
    return getStoredSettings();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    saveStoredSettings(updated);

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // Fallback
    }

    return updated;
  },

  async resetSeedData(): Promise<Order[]> {
    saveStoredOrders(INITIAL_SAMPLE_ORDERS);
    saveStoredSettings(INITIAL_SETTINGS);
    try {
      await fetch('/api/orders/seed', { method: 'POST' });
    } catch {
      // Fallback
    }
    return INITIAL_SAMPLE_ORDERS;
  },
};
