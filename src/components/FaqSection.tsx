import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: '⏰ Quanto tempo demora para ficar pronto?',
      a: 'O prazo varia conforme a complexidade e a fila atual (normalmente de 3 a 7 dias úteis após a confirmação do pagamento). Você sempre pode acompanhar o status em tempo real aqui no site digitando o seu código #ID!',
    },
    {
      q: '🔄 Como funciona a revisão do desenho?',
      a: 'Cada comissão inclui 1 rodada de revisão gratuita na fase de esboço/lineart (quando o status estiver em "Aguardando Revisão"). Mudanças adicionais ou após a pintura finalizada podem ter um pequeno ajuste de valor acordado previamente.',
    },
    {
      q: '🔍 Preciso mandar mensagem perguntando como está meu desenho?',
      a: 'Não precisa! Foi para isso que criamos a área "Acompanhar Pedido". Assim que a May atualiza o status ou posta uma prévia, você vê tudo na hora pelo seu código de pedido #MA-XXXX.',
    },
    {
      q: '📩 Como vou receber minha arte final?',
      a: 'Você recebe os arquivos digitais em alta resolução (PNG com e sem fundo transparente, prontos para usar como foto de perfil, wallpapers ou impressão) diretamente pelo contato informado (Instagram, WhatsApp ou E-mail).',
    },
    {
      q: '💰 Quais são as formas de pagamento?',
      a: 'Aceitamos Pix (aprovação imediata para entrar na fila de produção). Ao enviar o pedido, você receberá a chave Pix e o orçamento confirmado.',
    },
    {
      q: '🎨 Posso usar a arte comercialmente?',
      a: 'Os valores da tabela são para uso pessoal (redes sociais, fotos de perfil, presentes). Para produtos comerciais, logos de empresas ou revenda, combinamos uma taxa de licença comercial.',
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F65D8E] bg-[#FFF0F5] px-3.5 py-1 rounded-full border border-[#FFD9E4]">
          Tire Suas Dúvidas
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-[#4A3B47] mt-3 mb-3">
          Perguntas Frequentes
        </h2>
        <p className="text-sm sm:text-base text-[#8A7A84] max-w-md mx-auto">
          Tudo o que você precisa saber sobre o processo de comissão, prazos e entregas.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white border-2 border-[#FFD9E4] rounded-2xl overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 font-bold text-[#4A3B47] hover:text-[#F65D8E] transition-colors cursor-pointer"
              >
                <span className="text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#8A7A84] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#F65D8E]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-[#7A6975] leading-relaxed border-t border-[#FFF0F5] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
