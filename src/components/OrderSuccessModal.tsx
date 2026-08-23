import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, MessageSquare, Search, Sparkles, X, ArrowRight } from 'lucide-react';
import { Order, STATUS_CONFIG } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  whatsappUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  whatsappUrl,
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`#${order.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTrackNow = () => {
    onClose();
    onTrackOrder(order.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#FFD9E4] shadow-2xl relative animate-scaleUp overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFE3EC] rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#8A7A84] hover:bg-[#FFF0F5] hover:text-[#4A3B47] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2">
          {/* Header icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF8FAB] to-[#F65D8E] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-[#2E9E63] bg-[#E8FFF1] border border-[#9BE3BC] px-3.5 py-1 rounded-full">
            ✨ Pedido Gerado com Sucesso!
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-[#4A3B47] mt-3 mb-1">
            Seu código de pedido foi criado!
          </h3>

          <p className="text-xs sm:text-sm text-[#8A7A84] mb-6">
            Guarde esse código para consultar o andamento da sua arte no site sempre que quiser.
          </p>

          {/* ID Card Display with Copy button */}
          <div className="bg-[#FFF7FA] border-2 border-dashed border-[#FF8FAB] rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold text-[#8A7A84] uppercase tracking-wider">Número do Pedido</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F65D8E] tracking-wider font-mono">
                #{order.id}
              </div>
            </div>

            <button
              id="copy-order-id-btn"
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-[#E8FFF1] text-[#1E7E48] border border-[#9BE3BC]'
                  : 'bg-white text-[#4A3B47] hover:bg-[#FFF0F5] border border-[#FFD9E4]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#1E7E48]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#8A7A84]" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <a
              id="open-whatsapp-modal-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20BE5B] text-white font-bold py-3.5 px-5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm text-decoration-none cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Enviar Pedido no WhatsApp da May 💬</span>
            </a>

            <button
              id="track-order-modal-btn"
              onClick={handleTrackNow}
              className="w-full bg-[#FFF0F5] hover:bg-[#F7EEFF] text-[#795290] border border-[#E9D5FF] font-bold py-3 px-5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#C77DFF]" />
              <span>Acompanhar status deste pedido agora</span>
              <ArrowRight className="w-4 h-4 text-[#C77DFF]" />
            </button>
          </div>

          <p className="text-[11px] text-[#8A7A84] mt-4">
            💡 Você não precisa mandar mensagens perguntando o status: consulte aqui no site a qualquer hora com o código <strong>#{order.id}</strong>!
          </p>
        </div>
      </div>
    </div>
  );
};
