import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Palette,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Sparkles,
  ChevronRight,
  HelpCircle,
  FileCheck,
  Calendar,
  DollarSign,
  User,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus, STATUS_CONFIG, ORDER_WORKFLOW_STEPS } from '../types';
import { apiService, buildWhatsAppOrderUrl } from '../services/api';

interface OrderTrackerProps {
  initialOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
  whatsappNumber: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  initialOrderId = '',
  onSelectOrder,
  whatsappNumber,
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (orderIdToSearch: string, silent = false) => {
    const term = orderIdToSearch.trim();
    if (!term) return;

    if (!silent) {
      setIsLoading(true);
      setNotFound(false);
      setHasSearched(true);
    }

    try {
      const order = await apiService.getOrderById(term);
      if (order) {
        setCurrentOrder(order);
        setNotFound(false);
        if (onSelectOrder) onSelectOrder(order.id);
      } else {
        if (!silent) {
          setCurrentOrder(null);
          setNotFound(true);
        }
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setNotFound(true);
        setCurrentOrder(null);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setSearchInput(initialOrderId);
      performSearch(initialOrderId);
    }
  }, [initialOrderId]);

  // Real-time polling when an order is actively being tracked
  useEffect(() => {
    if (!currentOrder) return;
    const interval = setInterval(() => {
      performSearch(currentOrder.id, true);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentOrder?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  const handleRefresh = async () => {
    if (currentOrder) {
      await performSearch(currentOrder.id);
    }
  };

  // Helper to determine step status in the workflow
  const getStepState = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'CANCELADO') {
      return 'cancelled';
    }
    const currentConfig = STATUS_CONFIG[currentStatus];
    const targetConfig = STATUS_CONFIG[stepKey];

    if (!currentConfig || !targetConfig) return 'upcoming';

    if (currentConfig.stepIndex > targetConfig.stepIndex) {
      return 'completed';
    } else if (currentConfig.stepIndex === targetConfig.stepIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const activeStatusCfg = currentOrder ? STATUS_CONFIG[currentOrder.status] : null;

  return (
    <section id="rastrear" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C77DFF] bg-[#F7EEFF] px-3.5 py-1 rounded-full border border-[#E9D5FF]">
          Acompanhamento em Tempo Real
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-[#4A3B47] mt-3 mb-3">
          Acompanhar Meu Pedido 🔍
        </h2>
        <p className="text-sm sm:text-base text-[#8A7A84] max-w-lg mx-auto">
          Digite o código do seu pedido gerado no site (ex: <strong>#MA-1001</strong>) para ver o status atual, prazos e recadinhos da May.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border-2 border-[#FFD9E4] rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8A7A84]">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="tracker-search-input"
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Digite o código do seu pedido (Ex: #MA-1001 ou MA-1001)"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#FFD9E4] focus:border-[#C77DFF] bg-[#FFFBFD] text-sm sm:text-base text-[#4A3B47] placeholder-[#B5A5AF] outline-none transition-colors font-medium uppercase"
            />
          </div>

          <button
            id="tracker-search-btn"
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="bg-[#C77DFF] hover:bg-[#B35BE8] disabled:opacity-50 text-white font-bold px-7 py-3.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Consultar Status</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex items-center justify-between text-[11px] text-[#8A7A84] pt-2 border-t border-[#FFF0F5]">
          <span>💡 O código é gerado automaticamente quando você envia o formulário de pedido.</span>
          {currentOrder && (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Sincronizado ao vivo
            </span>
          )}
        </div>
      </div>

      {/* Not Found State */}
      {notFound && hasSearched && (
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-8 text-center shadow-xs animate-fadeIn">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#4A3B47] mb-1">Pedido não encontrado</h3>
          <p className="text-xs sm:text-sm text-[#8A7A84] max-w-md mx-auto mb-4">
            Não encontramos nenhum pedido com o código <strong>"{searchInput}"</strong>. Verifique se digitou corretamente ou faça um novo pedido.
          </p>
          <a
            href="#pedido"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#F65D8E] bg-[#FFF0F5] hover:bg-[#FFE3EC] px-4 py-2 rounded-full transition-colors"
          >
            Fazer um novo pedido agora 💌
          </a>
        </div>
      )}

      {/* Order Result Card */}
      {currentOrder && activeStatusCfg && (
        <div className="bg-white border-2 border-[#FFD9E4] rounded-3xl p-6 sm:p-8 shadow-md relative animate-fadeIn">
          {/* Top Bar / Header with refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FFD9E4]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF8FAB] to-[#C77DFF] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#4A3B47] font-mono tracking-tight">
                    #{currentOrder.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FFF0F5] text-[#F65D8E] border border-[#FFD9E4]">
                    {currentOrder.artType}
                  </span>
                </div>
                <p className="text-xs text-[#8A7A84] mt-0.5">
                  Cliente: <strong className="text-[#4A3B47]">{currentOrder.customerName}</strong> • Solicitado em {new Date(currentOrder.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              id="tracker-refresh-btn"
              onClick={handleRefresh}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#795290] bg-[#F7EEFF] hover:bg-[#E9D5FF] transition-colors cursor-pointer border border-[#E9D5FF]"
              title="Atualizar status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>

          {/* Current Status Highlight Banner */}
          <div className={`my-6 p-5 sm:p-6 rounded-2xl border-2 ${activeStatusCfg.bgColor} ${activeStatusCfg.borderColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div className="flex items-center gap-3.5">
              <div className="text-3xl sm:text-4xl shrink-0 p-2 bg-white/80 rounded-2xl shadow-xs">
                {activeStatusCfg.emoji}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8A7A84]">Status Atual do Pedido</div>
                <h3 className={`text-lg sm:text-xl font-bold ${activeStatusCfg.color}`}>
                  {activeStatusCfg.label}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C4D59] mt-0.5 font-medium">
                  {activeStatusCfg.description}
                </p>
              </div>
            </div>

            {/* Quick meta badge */}
            {currentOrder.estimatedDelivery && (
              <div className="bg-white/90 border border-current/20 px-3.5 py-2 rounded-xl text-xs shrink-0 self-stretch sm:self-auto text-center sm:text-right">
                <span className="text-[10px] uppercase font-bold text-[#8A7A84] block">Previsão</span>
                <strong className="text-[#4A3B47]">{currentOrder.estimatedDelivery}</strong>
              </div>
            )}
          </div>

          {/* Visual Step Progress Tracker (If not cancelled) */}
          {currentOrder.status !== 'CANCELADO' ? (
            <div className="mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7A84] mb-4">
                Progresso da Comissão
              </h4>

              <div className="relative">
                {/* Steps layout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {ORDER_WORKFLOW_STEPS.map((stepKey, idx) => {
                    const stepCfg = STATUS_CONFIG[stepKey];
                    const state = getStepState(stepKey, currentOrder.status);

                    let iconColor = 'text-gray-300 bg-gray-100 border-gray-200';
                    let titleColor = 'text-gray-400 font-medium';

                    if (state === 'completed') {
                      iconColor = 'text-white bg-[#2E9E63] border-[#2E9E63] shadow-xs';
                      titleColor = 'text-[#1E7E48] font-bold';
                    } else if (state === 'current') {
                      iconColor = 'text-white bg-[#F65D8E] border-[#F65D8E] shadow-sm ring-4 ring-[#FFD9E4] animate-pulse';
                      titleColor = 'text-[#F65D8E] font-bold';
                    }

                    return (
                      <div
                        key={stepKey}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[90px] ${
                          state === 'current'
                            ? 'bg-[#FFF0F5] border-[#FF8FAB]'
                            : state === 'completed'
                            ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                            : 'bg-[#FAFAFA] border-gray-100 opacity-60'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs border ${iconColor} mb-1.5`}>
                          {state === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>

                        <div className="text-[11px] leading-tight">
                          <span className="block mb-0.5">{stepCfg.emoji}</span>
                          <span className={`${titleColor} block`}>{stepCfg.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-8 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Este pedido foi cancelado. Se tiver dúvidas, fale diretamente com a May.</span>
            </div>
          )}

          {/* Details & Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#FFD9E4]">
            {/* Left: Order summary details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7A84] flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#F65D8E]" />
                <span>Resumo da Solicitação</span>
              </h4>

              <div className="bg-[#FFFBFD] border border-[#FFD9E4] rounded-2xl p-4 space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[#8A7A84] font-medium block text-xs">Ideia / Detalhes:</span>
                  <p className="text-[#4A3B47] mt-0.5 font-medium whitespace-pre-line leading-relaxed">
                    {currentOrder.details}
                  </p>
                </div>

                {currentOrder.referenceLinks && (
                  <div className="pt-2 border-t border-[#FFF0F5]">
                    <span className="text-[#8A7A84] font-medium block text-xs">Links de Referência:</span>
                    <p className="text-[#795290] mt-0.5 break-all text-xs font-mono">
                      {currentOrder.referenceLinks}
                    </p>
                  </div>
                )}

                {currentOrder.price && (
                  <div className="pt-2 border-t border-[#FFF0F5] flex items-center justify-between">
                    <span className="text-[#8A7A84] font-medium text-xs">Valor da comissão:</span>
                    <strong className="text-[#F65D8E] font-bold text-sm">{currentOrder.price}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Updates & Artist Messages Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7A84] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C77DFF]" />
                <span>Linha do Tempo & Recados da May</span>
              </h4>

              <div className="bg-[#FFFBFD] border border-[#FFD9E4] rounded-2xl p-4 max-h-64 overflow-y-auto space-y-3">
                {currentOrder.notes && currentOrder.notes.length > 0 ? (
                  currentOrder.notes
                    .filter(n => n.isPublic !== false)
                    .map((note) => (
                      <div key={note.id} className="text-xs pb-3 border-b border-[#FFF0F5] last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between text-[10px] text-[#8A7A84] mb-1">
                          <span className={`font-bold ${note.author.includes('May') ? 'text-[#F65D8E]' : 'text-[#8A7A84]'}`}>
                            {note.author}
                          </span>
                          <span>
                            {new Date(note.timestamp).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[#4A3B47] font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-[#FFD9E4]/60">
                          {note.text}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-[#8A7A84] text-center py-4">
                    Nenhuma atualização adicional no momento.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom WhatsApp Contact Button */}
          <div className="mt-8 pt-4 border-t border-[#FFD9E4] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#8A7A84] text-center sm:text-left">
              💬 Precisa enviar mais imagens ou falar com a May sobre o pedido <strong>#{currentOrder.id}</strong>?
            </p>
            <a
              id="tracker-whatsapp-contact-btn"
              href={buildWhatsAppOrderUrl(whatsappNumber, currentOrder)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BE5B] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs text-decoration-none shrink-0"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Falar no WhatsApp com o #{currentOrder.id}</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
