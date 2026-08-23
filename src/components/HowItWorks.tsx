import React from 'react';
import { Send, FileText, CreditCard, HeartHandshake } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: 1,
      icon: FileText,
      title: 'Você preenche o pedido',
      desc: 'Escolha o tipo de arte, conte sua ideia, detalhes dos personagens e adicione links de referências.',
      tag: 'Formulário Fácil',
    },
    {
      num: 2,
      icon: Send,
      title: 'Gera o ID & Envia no WhatsApp',
      desc: 'O sistema cria seu código (ex: #MA-1047) e gera o resumo para enviar no WhatsApp da May com 1 clique.',
      tag: 'Notificação Direta',
    },
    {
      num: 3,
      icon: CreditCard,
      title: 'Confirmação & Pagamento',
      desc: 'A May avalia, confirma os detalhes e valores. Após o Pix, o status vira "Pagamento Confirmado" e entra em produção.',
      tag: 'Seguro via Pix',
    },
    {
      num: 4,
      icon: HeartHandshake,
      title: 'Acompanhe pelo site & Receba',
      desc: 'Consulte o andamento da arte a qualquer momento pelo código. Você recebe os arquivos em alta qualidade!',
      tag: 'Rastreio 24h',
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F65D8E] bg-[#FFF0F5] px-3.5 py-1 rounded-full border border-[#FFD9E4]">
          Passo a Passo
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-[#4A3B47] mt-3 mb-3">
          Como funciona o seu pedido?
        </h2>
        <p className="text-sm sm:text-base text-[#8A7A84] max-w-xl mx-auto">
          Um fluxo simples e transparente para você não precisar ficar na dúvida sobre o andamento do seu desenho.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="bg-white border-2 border-[#FFD9E4] rounded-2xl p-6 text-center shadow-xs hover:shadow-md hover:border-[#FF8FAB] transition-all relative flex flex-col justify-between group"
            >
              <div>
                {/* Step indicator */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF8FAB] to-[#F65D8E] text-white flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-xs group-hover:scale-105 transition-transform">
                  {step.num}
                </div>

                <div className="inline-block text-[11px] font-bold text-[#C77DFF] bg-[#F7EEFF] px-2.5 py-0.5 rounded-full mb-3">
                  {step.tag}
                </div>

                <h3 className="text-base font-bold text-[#4A3B47] mb-2 leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#7A6975] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#FFF0F5] flex justify-center">
                <Icon className="w-5 h-5 text-[#FFB3C6] group-hover:text-[#F65D8E] transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
