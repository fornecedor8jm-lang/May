import React from 'react';
import { Sparkles, Palette, Search, ArrowRight, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onNavigate: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onNavigate }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-[#FFF0F5] via-[#FFF7FA] to-[#FFF7FA]">
      {/* Background soft pastel ambient glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#FFE3EC] rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-[#EDE0FF] rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-xs border transition-all ${
          settings.isCommissionsOpen
            ? 'bg-[#E8FFF1] text-[#1E7E48] border-[#9BE3BC]'
            : 'bg-[#FFF3E0] text-[#B76E00] border-[#FFE0B2]'
        }">
          <span className="w-2 h-2 rounded-full bg-[#2E9E63] animate-pulse" />
          <span>{settings.isCommissionsOpen ? '✨ Comissões abertas no momento!' : '⏸️ Comissões pausadas temporariamente'}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#4A3B47] mb-5 leading-tight">
          Oi, eu sou a <span className="text-[#F65D8E] relative inline-block">May!</span> 🎨
        </h1>

        <p className="text-lg sm:text-xl text-[#7A6975] max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
          Transformo suas ideias em ilustrações cheias de personalidade e afeto: 
          <strong className="text-[#4A3B47] font-semibold"> chibis, icons, metadinhas</strong> e artes personalizadas.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-12">
          <button
            id="hero-fazer-pedido-btn"
            onClick={() => onNavigate('pedido')}
            className="w-full sm:w-auto bg-[#F65D8E] hover:bg-[#FF8FAB] text-white font-bold px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Palette className="w-5 h-5" />
            <span>Fazer meu pedido</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-acompanhar-pedido-btn"
            onClick={() => onNavigate('rastrear')}
            className="w-full sm:w-auto bg-white hover:bg-[#F7EEFF] text-[#795290] border-2 border-[#E9D5FF] font-bold px-6 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4 text-[#C77DFF]" />
            <span>Acompanhar status (#ID)</span>
          </button>
        </div>

        {/* Highlight Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto">
          <div className="bg-white/80 border border-[#FFD9E4] rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F5] text-[#F65D8E] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#4A3B47]">Código Único #ID</h4>
              <p className="text-[11px] text-[#8A7A84]">Gerado automaticamente ao enviar</p>
            </div>
          </div>

          <div className="bg-white/80 border border-[#FFD9E4] rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#4A3B47]">Direto no WhatsApp</h4>
              <p className="text-[11px] text-[#8A7A84]">A May recebe tudo formatadinho</p>
            </div>
          </div>

          <div className="bg-white/80 border border-[#FFD9E4] rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#9333EA] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#4A3B47]">Rastreio em Tempo Real</h4>
              <p className="text-[11px] text-[#8A7A84]">Sem precisar cobrar status</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
