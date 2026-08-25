import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Check,
  MessageSquare,
  Instagram,
  Mail,
  Send,
  Plus,
  RefreshCw,
  X,
  ExternalLink,
  Settings,
  DollarSign,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  Tag,
  Star,
  Palette,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Order, OrderStatus, SiteSettings, STATUS_CONFIG, ORDER_WORKFLOW_STEPS, PricePackage } from '../types';
import { apiService } from '../services/api';

interface AdminPanelProps {
  orders: Order[];
  settings: SiteSettings;
  isOpen: boolean;
  onClose: () => void;
  onRefreshOrders: () => void;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  settings,
  isOpen,
  onClose,
  onRefreshOrders,
  onUpdateSettings,
}) => {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'pedidos' | 'precos' | 'configuracoes'>('pedidos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order for Edit/Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('RECEBIDO');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editArtType, setEditArtType] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editRefLinks, setEditRefLinks] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDelivery, setEditDelivery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  // Prices Management State
  const [pricesList, setPricesList] = useState<PricePackage[]>(settings.prices || []);
  const [pricesSavedMessage, setPricesSavedMessage] = useState(false);

  // New Order Modal State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newOrderError, setNewOrderError] = useState('');
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    contact: '',
    contactType: 'whatsapp' as 'whatsapp' | 'instagram' | 'email' | 'outro',
    artType: 'Chibi (R$ 10,00)',
    details: '',
    referenceLinks: '',
    price: 'R$ 10,00',
    estimatedDelivery: '',
    initialStatus: 'RECEBIDO' as OrderStatus,
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Delete Order Confirmation Modal State
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [deletedNotification, setDeletedNotification] = useState<string | null>(null);

  // Settings form state
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(settings.whatsappNumber);
  const [settingsPix, setSettingsPix] = useState(settings.pixKey);
  const [settingsPin, setSettingsPin] = useState(settings.adminPin);
  const [settingsIsOpen, setSettingsIsOpen] = useState(settings.isCommissionsOpen);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Sync settings when props change
  useEffect(() => {
    if (settings.prices && settings.prices.length > 0) {
      setPricesList(settings.prices);
    }
    setSettingsWhatsapp(settings.whatsappNumber);
    setSettingsPix(settings.pixKey);
    setSettingsPin(settings.adminPin);
    setSettingsIsOpen(settings.isCommissionsOpen);
  }, [settings]);

  // Real-time polling while admin panel is open to capture new incoming customer orders immediately
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const pollInterval = setInterval(() => {
      onRefreshOrders();
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [isOpen, isAuthenticated, onRefreshOrders]);

  if (!isOpen) return null;

  // Handle PIN Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '#May1shere') {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter === 'ativos') {
      if (order.status === 'FINALIZADO' || order.status === 'CANCELADO') return false;
    } else if (statusFilter !== 'todos' && order.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q) || `#${order.id.toLowerCase()}`.includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchContact = order.contact.toLowerCase().includes(q);
      const matchDetails = order.details.toLowerCase().includes(q);
      const matchArt = order.artType.toLowerCase().includes(q);
      return matchId || matchName || matchContact || matchDetails || matchArt;
    }

    return true;
  });

  // Open Edit Order Modal
  const handleOpenOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setEditCustomerName(order.customerName || '');
    setEditContact(order.contact || '');
    setEditArtType(order.artType || '');
    setEditDetails(order.details || '');
    setEditRefLinks(order.referenceLinks || '');
    setEditPrice(order.price || '');
    setEditDelivery(order.estimatedDelivery || '');
    setNoteMessage('');
  };

  // Save Status & Note & Details Updates
  const handleSaveOrderStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      // First update details if changed
      await apiService.updateOrderDetails(selectedOrder.id, {
        customerName: editCustomerName.trim() || selectedOrder.customerName,
        contact: editContact.trim() || selectedOrder.contact,
        artType: editArtType.trim() || selectedOrder.artType,
        details: editDetails.trim() || selectedOrder.details,
        referenceLinks: editRefLinks.trim(),
      });

      // Update status & timeline
      const updated = await apiService.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        noteMessage,
        editDelivery,
        editPrice
      );

      if (updated) {
        setSelectedOrder(updated);
        onRefreshOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
      setSelectedOrder(null);
    }
  };

  // Create New Order from Admin
  const handleCreateNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.customerName.trim() || !newOrderForm.details.trim()) {
      setNewOrderError('Por favor, preencha o nome do cliente e os detalhes da arte.');
      return;
    }
    setNewOrderError('');

    setIsCreatingOrder(true);
    try {
      const { order } = await apiService.createOrder({
        customerName: newOrderForm.customerName,
        contact: newOrderForm.contact || 'Não informado',
        contactType: newOrderForm.contactType,
        artType: newOrderForm.artType,
        details: newOrderForm.details,
        referenceLinks: newOrderForm.referenceLinks,
      });

      // If custom status, price or delivery were specified, update them
      if (
        newOrderForm.initialStatus !== 'RECEBIDO' ||
        newOrderForm.price ||
        newOrderForm.estimatedDelivery
      ) {
        await apiService.updateOrderStatus(
          order.id,
          newOrderForm.initialStatus,
          'Pedido cadastrado manualmente pela artista.',
          newOrderForm.estimatedDelivery,
          newOrderForm.price
        );
      }

      // Reset form and refresh list
      setNewOrderForm({
        customerName: '',
        contact: '',
        contactType: 'whatsapp',
        artType: 'Chibi',
        details: '',
        referenceLinks: '',
        price: '',
        estimatedDelivery: '',
        initialStatus: 'RECEBIDO',
      });
      setIsNewOrderModalOpen(false);
      onRefreshOrders();
    } catch (err) {
      console.error('Failed to create order', err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Trigger Delete Order Confirmation Modal
  const handleRequestDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
  };

  // Confirm and Execute Deletion
  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeletingOrder(true);
    try {
      const targetId = orderToDelete.id;
      await apiService.deleteOrder(targetId);
      if (selectedOrder?.id === targetId) {
        setSelectedOrder(null);
      }
      setOrderToDelete(null);
      onRefreshOrders();
      setDeletedNotification(`Pedido #${targetId} excluído com sucesso!`);
      setTimeout(() => setDeletedNotification(null), 4000);
    } catch (err) {
      console.error('Erro ao excluir pedido', err);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // Copy Contact to Clipboard
  const handleCopyContact = (contactText: string) => {
    navigator.clipboard.writeText(contactText);
    setCopiedContact(contactText);
    setTimeout(() => setCopiedContact(null), 2000);
  };

  // Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      whatsappNumber: settingsWhatsapp,
      pixKey: settingsPix,
      adminPin: settingsPin,
      isCommissionsOpen: settingsIsOpen,
    });
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Price Package Handlers
  const handlePriceFieldChange = (index: number, field: keyof PricePackage, value: any) => {
    setPricesList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFeatureChange = (pkgIndex: number, featureIndex: number, value: string) => {
    setPricesList(prev => {
      const next = [...prev];
      const newFeatures = [...next[pkgIndex].features];
      newFeatures[featureIndex] = value;
      next[pkgIndex] = { ...next[pkgIndex], features: newFeatures };
      return next;
    });
  };

  const handleAddFeature = (pkgIndex: number) => {
    setPricesList(prev => {
      const next = [...prev];
      const newFeatures = [...next[pkgIndex].features, 'Novo detalhe incluso'];
      next[pkgIndex] = { ...next[pkgIndex], features: newFeatures };
      return next;
    });
  };

  const handleRemoveFeature = (pkgIndex: number, featureIndex: number) => {
    setPricesList(prev => {
      const next = [...prev];
      const newFeatures = next[pkgIndex].features.filter((_, idx) => idx !== featureIndex);
      next[pkgIndex] = { ...next[pkgIndex], features: newFeatures };
      return next;
    });
  };

  const handleAddNewPackage = () => {
    const newId = `pkg_${Date.now()}`;
    const newPkg: PricePackage = {
      id: newId,
      name: 'Novo Estilo',
      price: 'R$ 20,00',
      unit: '/ un',
      features: ['Ilustração personalizada', 'Fundo simples', 'Alta resolução (PNG)'],
      tag: 'Novo',
    };
    setPricesList(prev => [...prev, newPkg]);
  };

  const handleRemovePackage = (pkgIndex: number) => {
    if (pricesList.length <= 1) {
      return;
    }
    setPricesList(prev => prev.filter((_, idx) => idx !== pkgIndex));
  };

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      prices: pricesList,
    });
    setPricesSavedMessage(true);
    setTimeout(() => setPricesSavedMessage(false), 3000);
  };

  // Metrics Count
  const countTotal = orders.length;
  const countInProduction = orders.filter(o => o.status === 'PRODUCAO').length;
  const countPending = orders.filter(
    o => o.status === 'RECEBIDO' || o.status === 'ANALISE' || o.status === 'AGUARDANDO_PAGAMENTO' || o.status === 'REVISAO'
  ).length;
  const countCompleted = orders.filter(o => o.status === 'FINALIZADO').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFF7FA] rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col border-2 border-[#FFD9E4] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Top Header */}
        <div className="px-6 py-4 bg-white border-b border-[#FFD9E4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C77DFF] to-[#F65D8E] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#4A3B47] flex items-center gap-2">
                Painel Administrativo da May
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F7EEFF] text-[#C77DFF] border border-[#E9D5FF]">
                  Gerenciador de Pedidos
                </span>
              </h3>
              <p className="text-xs text-[#8A7A84]">Altere status, visualize contatos e responda clientes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A7A84] hover:bg-[#FFF0F5] hover:text-[#4A3B47] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PIN Security Gate if not unlocked */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#F7EEFF] text-[#C77DFF] border border-[#E9D5FF] flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-[#4A3B47] mb-1">Acesso Restrito da Artista</h4>
            <p className="text-xs sm:text-sm text-[#8A7A84] max-w-sm mb-6">
              Digite a senha de segurança para gerenciar os pedidos e configurações da loja.
            </p>

            <form onSubmit={handleUnlock} className="flex flex-col items-center gap-3 w-full max-w-xs">
              <input
                type="password"
                maxLength={32}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Senha de acesso"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD9E4] focus:border-[#C77DFF] bg-white text-center text-lg font-bold tracking-widest outline-none"
                autoFocus
              />

              {pinError && (
                <span className="text-xs font-bold text-rose-500">Senha incorreta. Verifique e tente novamente.</span>
              )}

              <button
                type="submit"
                className="w-full bg-[#C77DFF] hover:bg-[#B35BE8] text-white font-bold py-3 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Entrar no Painel</span>
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Area */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation Tabs & Quick Metrics */}
            <div className="px-6 py-3 bg-white/60 border-b border-[#FFD9E4] flex flex-wrap items-center justify-between gap-3">
              {/* Tabs & New Order Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('pedidos')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'pedidos'
                      ? 'bg-[#F65D8E] text-white shadow-xs'
                      : 'bg-white text-[#7A6975] hover:bg-[#FFF0F5]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Todos os Pedidos ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('precos')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'precos'
                      ? 'bg-[#F65D8E] text-white shadow-xs'
                      : 'bg-white text-[#7A6975] hover:bg-[#FFF0F5]'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Tabela de Preços ({pricesList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('configuracoes')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'configuracoes'
                      ? 'bg-[#C77DFF] text-white shadow-xs'
                      : 'bg-white text-[#7A6975] hover:bg-[#F7EEFF]'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configurações & WhatsApp</span>
                </button>

                <button
                  onClick={() => setIsNewOrderModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ml-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Novo Pedido</span>
                </button>
              </div>

              {/* Metrics Pills */}
              <div className="hidden lg:flex items-center gap-2 text-xs">
                <div className="bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-lg font-bold">
                  🎨 Produção: {countInProduction}
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-lg font-bold">
                  ⏳ Pendentes: {countPending}
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">
                  ✅ Concluídos: {countCompleted}
                </div>
              </div>
            </div>

            {/* TAB: ORDERS */}
            {activeTab === 'pedidos' && (
              <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4">
                {/* Deleted Notification Toast */}
                {deletedNotification && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-xs animate-scaleUp">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{deletedNotification}</span>
                    </div>
                    <button
                      onClick={() => setDeletedNotification(null)}
                      className="text-rose-400 hover:text-rose-700 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Search and Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#8A7A84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar por cliente, #ID, contato ou tipo..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#FFD9E4] focus:border-[#C77DFF] rounded-xl text-xs sm:text-sm text-[#4A3B47] outline-none"
                    />
                  </div>

                  {/* Status Filter Dropdown / Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setStatusFilter('todos')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        statusFilter === 'todos'
                          ? 'bg-[#4A3B47] text-white'
                          : 'bg-white text-[#7A6975] hover:bg-[#FFF0F5] border border-[#FFD9E4]'
                      }`}
                    >
                      Todos ({orders.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('ativos')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        statusFilter === 'ativos'
                          ? 'bg-[#F65D8E] text-white'
                          : 'bg-white text-[#7A6975] hover:bg-[#FFF0F5] border border-[#FFD9E4]'
                      }`}
                    >
                      Em Andamento
                    </button>
                    <button
                      onClick={() => setStatusFilter('PRODUCAO')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        statusFilter === 'PRODUCAO'
                          ? 'bg-[#C77DFF] text-white'
                          : 'bg-white text-[#7A6975] hover:bg-[#FFF0F5] border border-[#FFD9E4]'
                      }`}
                    >
                      🎨 Em Produção
                    </button>
                    <button
                      onClick={() => setStatusFilter('FINALIZADO')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        statusFilter === 'FINALIZADO'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-[#7A6975] hover:bg-[#FFF0F5] border border-[#FFD9E4]'
                      }`}
                    >
                      ✅ Finalizados
                    </button>
                  </div>
                </div>

                {/* Orders List / Cards */}
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#FFD9E4] p-10 text-center text-[#8A7A84] space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF0F5] text-[#F65D8E] flex items-center justify-center mx-auto">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-[#4A3B47]">
                      {orders.length === 0 ? 'Nenhum pedido cadastrado ainda' : 'Nenhum pedido com este filtro'}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#8A7A84] max-w-md mx-auto">
                      {orders.length === 0
                        ? 'Quando um cliente enviar o formulário no site, o novo pedido aparecerá aqui automaticamente em tempo real com todos os dados!'
                        : 'Tente selecionar outro filtro acima ou limpar a barra de busca.'}
                    </p>
                    {orders.length === 0 && (
                      <div className="pt-2">
                        <button
                          onClick={() => setIsNewOrderModalOpen(true)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Cadastrar Pedido Manualmente</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredOrders.map(order => {
                      const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.RECEBIDO;
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border border-[#FFD9E4] p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          {/* Order Main Info */}
                          <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-extrabold text-[#4A3B47] font-mono">
                                #{order.id}
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FFF0F5] text-[#F65D8E] border border-[#FFD9E4]">
                                {order.artType}
                              </span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusCfg.bgColor} ${statusCfg.borderColor} ${statusCfg.color}`}>
                                {statusCfg.emoji} {statusCfg.label}
                              </span>
                            </div>

                            <div className="text-xs text-[#7A6975]">
                              <strong className="text-[#4A3B47]">{order.customerName}</strong> • Contato: {order.contact}
                            </div>

                            <p className="text-xs text-[#5C4D59] line-clamp-2 leading-relaxed bg-[#FFFBFD] p-2 rounded-xl border border-[#FFF0F5]">
                              {order.details}
                            </p>
                          </div>

                          {/* Quick Actions & Status Changer */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#FFF0F5]">
                            {/* Copy contact */}
                            <button
                              onClick={() => handleCopyContact(order.contact)}
                              className="px-3 py-2 bg-[#FFF7FA] hover:bg-[#FFF0F5] text-[#4A3B47] border border-[#FFD9E4] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              title="Copiar contato"
                            >
                              {copiedContact === order.contact ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-[#8A7A84]" />
                                  <span>Contato</span>
                                </>
                              )}
                            </button>

                            {/* Open Details & Update Modal */}
                            <button
                              onClick={() => handleOpenOrderModal(order)}
                              className="px-4 py-2 bg-[#F65D8E] hover:bg-[#FF8FAB] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Alterar Status / Detalhes</span>
                            </button>

                            {/* Quick Delete Button */}
                            <button
                              onClick={() => handleRequestDeleteOrder(order)}
                              className="p-2 text-rose-500 hover:text-rose-700 bg-[#FFF5F7] hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                              title="Excluir este pedido"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PRICES */}
            {activeTab === 'precos' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto w-full max-w-5xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-3xl border border-[#FFD9E4] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#C77DFF] bg-[#F7EEFF] px-2.5 py-0.5 rounded-full border border-[#E9D5FF]">
                        Gerenciador de Valores
                      </span>
                      <span className="text-xs font-bold text-[#8A7A84]">
                        • {pricesList.length} estilos configurados
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-[#4A3B47] mt-1 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#F65D8E]" />
                      Tabela de Preços & Estilos
                    </h4>
                    <p className="text-xs sm:text-sm text-[#8A7A84] mt-1">
                      Altere valores, nomes, tags e benefícios de cada estilo. Tudo atualiza em tempo real no site e no formulário de pedidos.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleAddNewPackage}
                      className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#C77DFF] border border-purple-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Adicionar Estilo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePrices}
                      className="px-5 py-2.5 bg-[#F65D8E] hover:bg-[#FF8FAB] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salvar Preços no Site</span>
                    </button>
                  </div>
                </div>

                {/* Saved Notification */}
                {pricesSavedMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-scaleUp">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Tabela de preços e estilos atualizada e sincronizada com sucesso no site!</span>
                  </div>
                )}

                {/* Packages List */}
                <form onSubmit={handleSavePrices} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {pricesList.map((pkg, index) => {
                      const isHighlighted = !!pkg.isHighlight;
                      return (
                        <div
                          key={pkg.id || index}
                          className={`bg-white rounded-3xl p-5 border-2 transition-all shadow-xs relative flex flex-col justify-between ${
                            isHighlighted
                              ? 'border-[#C77DFF] ring-2 ring-[#C77DFF]/15'
                              : 'border-[#FFD9E4] hover:border-[#FF8FAB]'
                          }`}
                        >
                          {/* Card Top Action Bar */}
                          <div className="flex items-center justify-between pb-3 border-b border-[#FFF0F5] mb-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#FFF0F5] text-[#F65D8E] text-xs font-bold flex items-center justify-center">
                                #{index + 1}
                              </span>
                              <span className="text-xs font-bold text-[#4A3B47]">
                                {pkg.name || 'Sem Nome'}
                              </span>
                              {pkg.tag && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F7EEFF] text-[#C77DFF] border border-[#E9D5FF]">
                                  {pkg.tag}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemovePackage(index)}
                              title="Excluir este estilo"
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Primary Inputs */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              {/* Name */}
                              <div>
                                <label className="block text-[11px] font-bold text-[#4A3B47] mb-1">
                                  Nome do Estilo / Arte *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={pkg.name}
                                  onChange={e => handlePriceFieldChange(index, 'name', e.target.value)}
                                  placeholder="Ex: Chibi, Icon..."
                                  className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs font-bold text-[#4A3B47] outline-none"
                                />
                              </div>

                              {/* Price */}
                              <div>
                                <label className="block text-[11px] font-bold text-[#4A3B47] mb-1">
                                  Preço / Valor *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={pkg.price}
                                  onChange={e => handlePriceFieldChange(index, 'price', e.target.value)}
                                  placeholder="Ex: R$ 10,00"
                                  className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs font-bold text-[#F65D8E] outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {/* Unit */}
                              <div>
                                <label className="block text-[11px] font-bold text-[#4A3B47] mb-1">
                                  Unidade / Formato
                                </label>
                                <input
                                  type="text"
                                  value={pkg.unit || ''}
                                  onChange={e => handlePriceFieldChange(index, 'unit', e.target.value)}
                                  placeholder="Ex: / un, / par"
                                  className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs text-[#4A3B47] outline-none"
                                />
                              </div>

                              {/* Tag / Badge */}
                              <div>
                                <label className="block text-[11px] font-bold text-[#4A3B47] mb-1">
                                  Selo / Tag (Opcional)
                                </label>
                                <input
                                  type="text"
                                  value={pkg.tag || ''}
                                  onChange={e => handlePriceFieldChange(index, 'tag', e.target.value)}
                                  placeholder="Ex: Mais Pedido ⭐"
                                  className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs text-[#4A3B47] outline-none"
                                />
                              </div>
                            </div>

                            {/* Highlight toggle */}
                            <div className="pt-1">
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#4A3B47] p-2 rounded-xl bg-[#FFFBFD] border border-[#FFD9E4]/60">
                                <input
                                  type="checkbox"
                                  checked={!!pkg.isHighlight}
                                  onChange={e => handlePriceFieldChange(index, 'isHighlight', e.target.checked)}
                                  className="w-4 h-4 text-[#C77DFF] rounded border-[#FFD9E4] focus:ring-[#C77DFF]"
                                />
                                <span className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                  Destacar este pacote no site (Card em destaque)
                                </span>
                              </label>
                            </div>

                            {/* Feature Items */}
                            <div className="pt-2">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-bold text-[#4A3B47] flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-[#C77DFF]" />
                                  Itens Inclusos / Benefícios:
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAddFeature(index)}
                                  className="text-[10px] font-bold text-[#C77DFF] hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  <Plus className="w-3 h-3" />
                                  + Adicionar Item
                                </button>
                              </div>

                              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {pkg.features.map((feat, fIndex) => (
                                  <div key={fIndex} className="flex items-center gap-1.5">
                                    <span className="text-[#C77DFF] text-xs">✓</span>
                                    <input
                                      type="text"
                                      value={feat}
                                      onChange={e => handleFeatureChange(index, fIndex, e.target.value)}
                                      placeholder="Ex: Alta resolução (PNG)"
                                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#FFD9E4] focus:border-[#C77DFF] bg-[#FFFBFD] text-xs text-[#4A3B47] outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFeature(index, fIndex)}
                                      className="p-1 text-[#8A7A84] hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Mini Live Preview */}
                          <div className="mt-4 pt-3 border-t border-[#FFF0F5] flex items-center justify-between text-xs bg-[#FFFBFD] p-2.5 rounded-xl">
                            <span className="text-[#8A7A84] text-[11px]">Como fica no site:</span>
                            <span className="font-extrabold text-[#F65D8E]">
                              {pkg.name || 'Estilo'}: {pkg.price} {pkg.unit || ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="sticky bottom-0 pt-3 pb-1 bg-[#FFF7FA]/90 backdrop-blur-xs flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#F65D8E] hover:bg-[#FF8FAB] text-white font-bold rounded-2xl text-sm shadow-md shadow-[#F65D8E]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salvar Todas as Alterações de Preço</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'configuracoes' && (
              <div className="flex-1 p-6 overflow-y-auto max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-3xl border border-[#FFD9E4] p-6 sm:p-8 shadow-xs">
                  <h4 className="text-lg font-bold text-[#4A3B47] mb-1 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#C77DFF]" />
                    Configurações da May Arts
                  </h4>
                  <p className="text-xs text-[#8A7A84] mb-6">
                    Ajuste o número do WhatsApp de recebimento, chave Pix e disponibilidade de novos pedidos.
                  </p>

                  {settingsSavedMessage && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Configurações salvas com sucesso!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                        Número do WhatsApp para Receber Pedidos (com DDD e 55)
                      </label>
                      <input
                        type="text"
                        value={settingsWhatsapp}
                        onChange={e => setSettingsWhatsapp(e.target.value)}
                        placeholder="Ex: 5511998765432"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#FFD9E4] focus:border-[#C77DFF] bg-[#FFFBFD] text-xs sm:text-sm font-mono"
                      />
                      <p className="text-[11px] text-[#8A7A84] mt-1">
                        Formato: código do país (55) + DDD + número. Ex: 5511987654321
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                        Chave Pix para Pagamentos
                      </label>
                      <input
                        type="text"
                        value={settingsPix}
                        onChange={e => setSettingsPix(e.target.value)}
                        placeholder="Ex: mayarts.desenhos@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#FFD9E4] focus:border-[#C77DFF] bg-[#FFFBFD] text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                        Senha de Acesso ao Painel Admin
                      </label>
                      <input
                        type="password"
                        value={settingsPin}
                        onChange={e => setSettingsPin(e.target.value)}
                        placeholder="Digite a nova senha"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#FFD9E4] focus:border-[#C77DFF] bg-[#FFFBFD] text-xs sm:text-sm font-mono"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#4A3B47]">
                        <input
                          type="checkbox"
                          checked={settingsIsOpen}
                          onChange={e => setSettingsIsOpen(e.target.checked)}
                          className="w-4 h-4 text-[#F65D8E] rounded border-[#FFD9E4] focus:ring-[#FF8FAB]"
                        />
                        <span>Comissões Abertas no Momento (Exibe badge no topo do site)</span>
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-[#C77DFF] hover:bg-[#B35BE8] text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Salvar Configurações</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAIL & STATUS EDIT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-[#FFD9E4] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#FFD9E4]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C77DFF]">Editar Pedido</span>
                <h3 className="text-xl font-bold text-[#4A3B47] flex items-center gap-2">
                  #{selectedOrder.id} • {selectedOrder.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#8A7A84] hover:bg-[#FFF0F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {/* Customer Info Recap / Editable */}
              <div className="bg-[#FFF7FA] border border-[#FFD9E4] rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A3B47] uppercase tracking-wider text-[11px]">Dados da Encomenda</span>
                  <button
                    type="button"
                    onClick={() => handleCopyContact(editContact || selectedOrder.contact)}
                    className="px-2.5 py-1 bg-white border border-[#FFD9E4] rounded-lg text-[11px] font-bold text-[#795290] flex items-center gap-1 cursor-pointer hover:bg-[#FFF0F5]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar Contato</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8A7A84] mb-1">Nome do Cliente:</label>
                    <input
                      type="text"
                      value={editCustomerName}
                      onChange={e => setEditCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-white text-xs text-[#4A3B47] outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8A7A84] mb-1">Contato (WhatsApp / Instagram):</label>
                    <input
                      type="text"
                      value={editContact}
                      onChange={e => setEditContact(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-white text-xs text-[#4A3B47] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8A7A84] mb-1">Tipo de Arte:</label>
                  <input
                    type="text"
                    list="edit-order-art-types"
                    value={editArtType}
                    onChange={e => setEditArtType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-white text-xs text-[#F65D8E] font-bold outline-none"
                  />
                  <datalist id="edit-order-art-types">
                    {pricesList.map(p => (
                      <option key={p.id} value={`${p.name} (${p.price})`} />
                    ))}
                    <option value="Outro estilo personalizado" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8A7A84] mb-1">Descrição / Detalhes do Pedido:</label>
                  <textarea
                    rows={3}
                    value={editDetails}
                    onChange={e => setEditDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-white text-xs text-[#4A3B47] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8A7A84] mb-1">Links de Referências (opcional):</label>
                  <input
                    type="text"
                    value={editRefLinks}
                    onChange={e => setEditRefLinks(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-white text-xs text-[#795290] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Status Change Selection */}
              <div>
                <label className="block text-xs font-bold text-[#4A3B47] mb-2">
                  Alterar Status do Pedido:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(STATUS_CONFIG).map(cfg => {
                    const isSelected = newStatus === cfg.key;
                    return (
                      <button
                        key={cfg.key}
                        type="button"
                        onClick={() => setNewStatus(cfg.key)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#F65D8E] text-white border-[#F65D8E] shadow-xs'
                            : 'bg-[#FFFBFD] text-[#4A3B47] border-[#FFD9E4] hover:bg-[#FFF0F5]'
                        }`}
                      >
                        <span>{cfg.emoji}</span>
                        <span className="truncate">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recado para o cliente (Public timeline note) */}
              <div>
                <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                  Mensagem / Recado da May (Ficará visível para o cliente no site):
                </label>
                <textarea
                  rows={2}
                  value={noteMessage}
                  onChange={e => setNoteMessage(e.target.value)}
                  placeholder="Ex: Lineart concluída! Começando a pintura digital..."
                  className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                />
              </div>

              {/* Price & Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                    Valor Acordado
                  </label>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    placeholder="Ex: R$ 45,00"
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                    Previsão de Entrega
                  </label>
                  <input
                    type="text"
                    value={editDelivery}
                    onChange={e => setEditDelivery(e.target.value)}
                    placeholder="Ex: 3 a 5 dias úteis"
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#FFD9E4] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleRequestDeleteOrder(selectedOrder)}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Pedido</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-[#8A7A84] hover:bg-[#FFF0F5] rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveOrderStatus}
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-[#F65D8E] hover:bg-[#FF8FAB] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW ORDER MODAL */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-[#FFD9E4] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#FFD9E4]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Novo Cadastro</span>
                <h3 className="text-xl font-bold text-[#4A3B47] flex items-center gap-2">
                  Adicionar Novo Pedido
                </h3>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8A7A84] hover:bg-[#FFF0F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateNewOrder} className="flex-1 overflow-y-auto py-4 space-y-4">
              {newOrderError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{newOrderError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.customerName}
                    onChange={e => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                    placeholder="Ex: Ana Clara"
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                    Contato (WhatsApp / Instagram) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.contact}
                    onChange={e => setNewOrderForm({ ...newOrderForm, contact: e.target.value })}
                    placeholder="Ex: (61) 99999-9999 ou @usuario"
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                    Tipo de Arte *
                  </label>
                  <input
                    type="text"
                    required
                    list="new-order-art-types"
                    value={newOrderForm.artType}
                    onChange={e => {
                      const val = e.target.value;
                      const matched = pricesList.find(p => p.name === val || `${p.name} (${p.price})` === val);
                      setNewOrderForm({
                        ...newOrderForm,
                        artType: val,
                        price: matched ? matched.price : newOrderForm.price,
                      });
                    }}
                    placeholder="Selecione ou digite..."
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                  />
                  <datalist id="new-order-art-types">
                    {pricesList.map(p => (
                      <option key={p.id} value={`${p.name} (${p.price})`} />
                    ))}
                    <option value="Outro estilo personalizado" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={newOrderForm.initialStatus}
                    onChange={e => setNewOrderForm({ ...newOrderForm, initialStatus: e.target.value as OrderStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none cursor-pointer"
                  >
                    {Object.values(STATUS_CONFIG).map(s => (
                      <option key={s.key} value={s.key}>
                        {s.emoji} {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                  Detalhes e Descrição da Arte *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newOrderForm.details}
                  onChange={e => setNewOrderForm({ ...newOrderForm, details: e.target.value })}
                  placeholder="Descreva poses, roupas, referências e desejos do cliente..."
                  className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                  Links de Referências (Opcional)
                </label>
                <input
                  type="text"
                  value={newOrderForm.referenceLinks}
                  onChange={e => setNewOrderForm({ ...newOrderForm, referenceLinks: e.target.value })}
                  placeholder="https://drive.google.com/... ou https://pinterest.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                    Valor Acordado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newOrderForm.price}
                    onChange={e => setNewOrderForm({ ...newOrderForm, price: e.target.value })}
                    placeholder="Ex: R$ 45,00"
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B47] mb-1">
                    Previsão de Entrega (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newOrderForm.estimatedDelivery}
                    onChange={e => setNewOrderForm({ ...newOrderForm, estimatedDelivery: e.target.value })}
                    placeholder="Ex: 3 a 5 dias úteis"
                    className="w-full px-3 py-2 rounded-xl border border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#FFD9E4] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#8A7A84] hover:bg-[#FFF0F5] rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isCreatingOrder ? 'Cadastrando...' : 'Cadastrar Pedido'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ORDER CONFIRMATION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-rose-200 shadow-2xl overflow-hidden flex flex-col space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Confirmar Exclusão</span>
                <h3 className="text-lg font-bold text-[#4A3B47]">
                  Excluir Pedido #{orderToDelete.id}?
                </h3>
              </div>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 text-xs text-[#5C4D59] space-y-2">
              <p>
                Tem certeza que deseja excluir o pedido de <strong>{orderToDelete.customerName}</strong> ({orderToDelete.artType})?
              </p>
              <p className="text-[11px] text-rose-700 font-semibold">
                ⚠️ Esta ação é permanente e removerá este pedido do painel administrativo e do rastreador público.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 text-xs font-bold text-[#8A7A84] hover:bg-[#FFF0F5] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleConfirmDeleteOrder}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingOrder ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sim, Excluir Pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
