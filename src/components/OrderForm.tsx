import React, { useState } from 'react';
import { Send, Heart, Sparkles, Link as LinkIcon, Instagram, Mail, Phone, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';
import { Order, SiteSettings } from '../types';

interface OrderFormProps {
  settings: SiteSettings;
  selectedArtType: string;
  onArtTypeChange: (type: string) => void;
  onOrderSuccess: (order: Order, whatsappUrl: string) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  settings,
  selectedArtType,
  onArtTypeChange,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'instagram' | 'whatsapp' | 'email' | 'outro'>('instagram');
  const [details, setDetails] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const artPackages = settings.prices && settings.prices.length > 0 ? settings.prices : [];

  // Match selectedArtType if passed as short name or full string
  const currentSelectValue = artPackages.some(p => p.name === selectedArtType)
    ? selectedArtType
    : selectedArtType || (artPackages[0]?.name ?? 'Chibi');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Por favor, informe seu nome ou como quer ser chamado(a).');
      return;
    }
    if (!contact.trim()) {
      setErrorMessage('Por favor, informe seu contato (Instagram, WhatsApp ou e-mail).');
      return;
    }
    if (!details.trim()) {
      setErrorMessage('Por favor, conte um pouco sobre como você quer sua arte.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find matching package to get default price if available
      const matchedPkg = artPackages.find(p => p.name === selectedArtType);
      const formattedArtType = matchedPkg 
        ? `${matchedPkg.name} (${matchedPkg.price})`
        : selectedArtType || 'Chibi';

      const result = await apiService.createOrder({
        customerName,
        contact,
        contactType,
        artType: formattedArtType,
        details,
        referenceLinks,
      });

      // Launch cheerful confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF8FAB', '#F65D8E', '#C77DFF', '#FFE3EC'],
        });
      } catch {
        // Safe confetti fallback
      }

      // Reset form
      setCustomerName('');
      setContact('');
      setDetails('');
      setReferenceLinks('');

      onOrderSuccess(result.order, result.whatsappUrl);
    } catch (err) {
      console.error(err);
      setErrorMessage('Houve um erro ao registrar seu pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pedido" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F65D8E] bg-[#FFF0F5] px-3.5 py-1 rounded-full border border-[#FFD9E4]">
          Formulário de Pedidos
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-[#4A3B47] mt-3 mb-3">
          Fazer um Pedido ✍️
        </h2>
        <p className="text-sm sm:text-base text-[#8A7A84] max-w-lg mx-auto">
          Me conta o que você sonhou! Ao enviar, o sistema gera o seu <strong>#ID único</strong> e abre o WhatsApp com todas as informações organizadas.
        </p>
      </div>

      <div className="bg-white border-2 border-[#FFD9E4] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background icon */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="w-36 h-36 text-[#F65D8E]" />
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" id="form-pedido-principal">
          {/* Nome */}
          <div>
            <label htmlFor="nome-input" className="block text-xs sm:text-sm font-bold text-[#4A3B47] mb-1.5">
              Seu nome ou como quer ser chamado(a) <span className="text-[#F65D8E]">*</span>
            </label>
            <input
              id="nome-input"
              type="text"
              required
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Ex.: Larissa Silva / Lari"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-sm text-[#4A3B47] placeholder-[#B5A5AF] outline-none transition-colors"
            />
          </div>

          {/* Contato e Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="tipo-contato-select" className="block text-xs sm:text-sm font-bold text-[#4A3B47] mb-1.5">
                Tipo de Contato
              </label>
              <select
                id="tipo-contato-select"
                value={contactType}
                onChange={e => setContactType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-sm text-[#4A3B47] outline-none transition-colors"
              >
                <option value="instagram">📸 Instagram</option>
                <option value="whatsapp">📱 WhatsApp</option>
                <option value="email">✉️ E-mail</option>
                <option value="outro">💬 Outro</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="contato-input" className="block text-xs sm:text-sm font-bold text-[#4A3B47] mb-1.5">
                Seu contato ({contactType === 'instagram' ? 'Ex: @sua_conta' : contactType === 'whatsapp' ? 'Ex: (11) 98765-4321' : 'Ex: seu@email.com'}) <span className="text-[#F65D8E]">*</span>
              </label>
              <input
                id="contato-input"
                type="text"
                required
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder={
                  contactType === 'instagram'
                    ? '@seu_perfil'
                    : contactType === 'whatsapp'
                    ? '(11) 99999-9999'
                    : 'seuemail@exemplo.com'
                }
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-sm text-[#4A3B47] placeholder-[#B5A5AF] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Tipo de Arte */}
          <div>
            <label htmlFor="tipo-arte-select" className="block text-xs sm:text-sm font-bold text-[#4A3B47] mb-1.5">
              Tipo de Arte <span className="text-[#F65D8E]">*</span>
            </label>
            <select
              id="tipo-arte-select"
              value={currentSelectValue}
              onChange={e => onArtTypeChange(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-sm text-[#4A3B47] outline-none transition-colors font-medium cursor-pointer"
            >
              {artPackages.map(pkg => (
                <option key={pkg.id} value={pkg.name}>
                  {pkg.name} — {pkg.price} {pkg.unit ? `(${pkg.unit})` : ''} {pkg.tag ? `• ${pkg.tag}` : ''}
                </option>
              ))}
              <option value="Outro estilo personalizado">
                ✨ Outro estilo personalizado (Sob consulta)
              </option>
            </select>
          </div>

          {/* Detalhes da Arte */}
          <div>
            <label htmlFor="detalhes-textarea" className="block text-xs sm:text-sm font-bold text-[#4A3B47] mb-1.5">
              O que você quer no desenho? <span className="text-[#F65D8E]">*</span>
            </label>
            <textarea
              id="detalhes-textarea"
              required
              rows={4}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Descreva sua ideia com carinho: quantos personagens, roupas, pose, cores preferidas, tema ou fundo..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-sm text-[#4A3B47] placeholder-[#B5A5AF] outline-none transition-colors resize-y"
            />
          </div>

          {/* Referências */}
          <div>
            <label htmlFor="refs-textarea" className="block text-xs sm:text-sm font-bold text-[#4A3B47] mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#C77DFF]" />
              <span>Referências de imagem (Links do Pinterest, Drive, Imgur, etc.)</span>
            </label>
            <textarea
              id="refs-textarea"
              rows={2}
              value={referenceLinks}
              onChange={e => setReferenceLinks(e.target.value)}
              placeholder="Cole links de referências aqui (fotos de personagens, paleta de cores ou poses que você gostou)"
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#FFD9E4] focus:border-[#F65D8E] bg-[#FFFBFD] text-sm text-[#4A3B47] placeholder-[#B5A5AF] outline-none transition-colors resize-y"
            />
            <p className="text-[11px] text-[#8A7A84] mt-1">
              ✨ Se preferir, você também pode enviar as imagens diretamente no WhatsApp logo após enviar este formulário.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              id="btn-enviar-pedido"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#F65D8E] to-[#FF8FAB] hover:from-[#F44B82] hover:to-[#F65D8E] text-white font-bold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando ID do Pedido...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Enviar pedido & Gerar meu #ID 💌</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-xs text-[#8A7A84] pt-1">
            🌸 <strong>Tudo automático:</strong> Seu código exclusivo será criado na hora para você acompanhar o status quando quiser!
          </div>
        </form>
      </div>
    </section>
  );
};
