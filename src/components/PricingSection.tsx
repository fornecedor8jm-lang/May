import React from 'react';
import { Check, Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import { PricePackage } from '../types';

interface PricingSectionProps {
  packages: PricePackage[];
  onSelectPackage: (packageName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ packages, onSelectPackage }) => {
  return (
    <section id="precos" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF7FA] via-[#FFF0F5]/50 to-[#FFF7FA]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C77DFF] bg-[#F7EEFF] px-3.5 py-1 rounded-full border border-[#E9D5FF]">
            Tabela de Valores
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#4A3B47] mt-3 mb-3">
            Ilustrações & Identidade Visual
          </h2>
          <p className="text-sm sm:text-base text-[#8A7A84] max-w-xl mx-auto">
            Escolha uma ilustração personalizada ou fortaleça a presença da sua marca com uma assinatura visual feita para você.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {packages.map((pkg) => {
            const isHighlight = pkg.isHighlight;
            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition-all relative border-2 ${
                  isHighlight
                    ? 'border-[#C77DFF] shadow-lg shadow-[#C77DFF]/10 scale-102 lg:-translate-y-2'
                    : 'border-[#FFD9E4] shadow-xs hover:border-[#FF8FAB] hover:shadow-md'
                }`}
              >
                {pkg.tag && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs whitespace-nowrap ${
                      isHighlight
                        ? 'bg-[#C77DFF] text-white'
                        : 'bg-[#FF8FAB] text-white'
                    }`}
                  >
                    {pkg.tag}
                  </div>
                )}

                <div>
                  <div className="text-center mb-4 pt-1">
                    <h3 className={`text-lg font-bold ${isHighlight ? 'text-[#C77DFF]' : 'text-[#4A3B47]'}`}>
                      {pkg.name}
                    </h3>
                    <div className="mt-3 flex items-baseline justify-center gap-1">
                      <span className="text-2xl sm:text-3xl font-bold text-[#F65D8E]">
                        {pkg.price}
                      </span>
                      <span className="text-xs font-semibold text-[#8A7A84]">
                        {pkg.unit}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#FFF0F5] mb-5" />

                  <ul className="space-y-2.5 mb-6 text-xs sm:text-sm text-[#7A6975]">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#E8FFF1] text-[#1E7E48] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button
                    id={`btn-select-package-${pkg.id}`}
                    onClick={() => onSelectPackage(pkg.name)}
                    className={`w-full py-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      isHighlight
                        ? 'bg-[#C77DFF] hover:bg-[#B35BE8] text-white'
                        : 'bg-[#FFF0F5] hover:bg-[#F65D8E] text-[#F65D8E] hover:text-white border border-[#FFD9E4]'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Pedir {pkg.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-gradient-to-br from-[#F7EEFF] via-white to-[#FFF0F5] border-2 border-[#E9D5FF] rounded-3xl p-5 sm:p-7 max-w-4xl mx-auto shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#C77DFF] flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C77DFF]">Novo serviço da May</span>
              <h3 className="text-lg sm:text-xl font-bold text-[#4A3B47] mt-1">Sua marca também pode aparecer em cada foto</h3>
              <p className="text-xs sm:text-sm text-[#7A6975] leading-relaxed mt-1.5">
                Crio uma marca d’água personalizada com assinatura visual única, versões em PNG transparente preta, branca e colorida, além de variações em ícone ou selo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectPackage('Marca d’água')}
              className="shrink-0 bg-[#C77DFF] hover:bg-[#B35BE8] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full shadow-sm transition-all cursor-pointer active:scale-95"
            >
              Quero minha marca d’água
            </button>
          </div>
          <div className="mt-5 pt-4 border-t border-[#E9D5FF] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-[#7A6975]">
            <span className="flex items-center justify-center sm:justify-start gap-1.5">✓ Arquivos prontos para o celular</span>
            <span className="flex items-center justify-center sm:justify-start gap-1.5">✓ Variações para qualquer fundo</span>
            <span className="flex items-center justify-center sm:justify-start gap-1.5">✓ Guia de uso no Canva ou CapCut</span>
          </div>
        </div>

        <div className="mt-5 bg-white/70 border border-[#FFD9E4] rounded-2xl p-4 sm:p-5 text-center max-w-2xl mx-auto text-xs text-[#8A7A84]">
          💡 <strong>Tem uma ideia diferente ou projeto especial?</strong> Você pode selecionar a opção <em>"Outro"</em> no formulário abaixo e descrever como deseja seu desenho!
        </div>
      </div>
    </section>
  );
};
