import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent store directory
const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default data
const DEFAULT_SETTINGS = {
  artistName: 'May',
  whatsappNumber: '5554981042011',
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
  ],
};

const DEFAULT_ORDERS: any[] = [];

function readOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(DEFAULT_ORDERS, null, 2));
  return DEFAULT_ORDERS;
}

function writeOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Error writing orders file:', err);
  }
}

function readSettings(): any {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  return DEFAULT_SETTINGS;
}

function writeSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error('Error writing settings file:', err);
  }
}

function generateServerOrderId(orders: any[]): string {
  const numbers = orders
    .map(o => {
      const match = (o.id || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(n => !isNaN(n) && n > 0);

  let nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1001;
  
  // Garantia absoluta de unicidade: avança até encontrar um ID livre
  while (orders.some(o => (o.id || '').toUpperCase() === `MA-${nextNum}`)) {
    nextNum++;
  }
  return `MA-${nextNum}`;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const paramId = (req.params.id || '').trim().replace(/^#/, '').toUpperCase();
  const orders = readOrders();
  const order = orders.find(o => o.id.toUpperCase() === paramId || `#${o.id.toUpperCase()}` === paramId);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const orders = readOrders();
  const rawOrder = req.body;
  if (!rawOrder || !rawOrder.customerName) {
    return res.status(400).json({ error: 'Dados inválidos do pedido' });
  }

  // Verifica se o ID enviado já existe ou não foi fornecido
  let finalId = (rawOrder.id || '').trim().toUpperCase();
  const idAlreadyExists = finalId ? orders.some(o => o.id.toUpperCase() === finalId) : true;

  // Se o ID já existir ou for vazio, gera um ID único garantido no servidor
  if (idAlreadyExists || !finalId) {
    finalId = generateServerOrderId(orders);
  }

  const now = new Date().toISOString();
  const finalOrder = {
    ...rawOrder,
    id: finalId,
    createdAt: rawOrder.createdAt || now,
    updatedAt: now,
    status: rawOrder.status || 'RECEBIDO',
    notes: Array.isArray(rawOrder.notes) && rawOrder.notes.length > 0 ? rawOrder.notes : [
      {
        id: `n-${Date.now()}`,
        timestamp: now,
        author: 'Sistema',
        text: 'Pedido registrado com sucesso no sistema.',
        isPublic: true,
      }
    ],
  };
  
  orders.unshift(finalOrder);
  writeOrders(orders);
  res.status(201).json(finalOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const paramId = (req.params.id || '').trim().replace(/^#/, '').toUpperCase();
  const { status, noteText, estimatedDelivery, price } = req.body;
  const orders = readOrders();
  const idx = orders.findIndex(o => o.id.toUpperCase() === paramId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  const current = orders[idx];
  const now = new Date().toISOString();
  const notes = current.notes || [];

  if (noteText && noteText.trim()) {
    notes.push({
      id: `n-${Date.now()}`,
      timestamp: now,
      author: 'May (Artista)',
      text: noteText.trim(),
      isPublic: true,
    });
  }

  const updated = {
    ...current,
    status: status || current.status,
    updatedAt: now,
    estimatedDelivery: estimatedDelivery !== undefined ? estimatedDelivery : current.estimatedDelivery,
    price: price !== undefined ? price : current.price,
    notes,
  };

  orders[idx] = updated;
  writeOrders(orders);
  res.json(updated);
});

app.patch('/api/orders/:id', (req, res) => {
  const paramId = (req.params.id || '').trim().replace(/^#/, '').toUpperCase();
  const updates = req.body;
  const orders = readOrders();
  const idx = orders.findIndex(o => o.id.toUpperCase() === paramId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  const updated = {
    ...orders[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  orders[idx] = updated;
  writeOrders(orders);
  res.json(updated);
});

app.delete('/api/orders/:id', (req, res) => {
  const paramId = (req.params.id || '').trim().replace(/^#/, '').toUpperCase();
  let orders = readOrders();
  const initialLength = orders.length;
  orders = orders.filter(o => (o.id || '').trim().replace(/^#/, '').toUpperCase() !== paramId);
  writeOrders(orders);
  res.json({ success: true, count: orders.length, deleted: orders.length < initialLength });
});

app.get('/api/settings', (req, res) => {
  const settings = readSettings();
  res.json(settings);
});

app.patch('/api/settings', (req, res) => {
  const current = readSettings();
  const updated = { ...current, ...req.body };
  writeSettings(updated);
  res.json(updated);
});

app.post('/api/orders/seed', (req, res) => {
  writeOrders(DEFAULT_ORDERS);
  writeSettings(DEFAULT_SETTINGS);
  res.json({ success: true, orders: DEFAULT_ORDERS, settings: DEFAULT_SETTINGS });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`May Arts Server running on port ${PORT}`);
  });
}

startServer();
