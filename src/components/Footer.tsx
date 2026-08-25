import React from 'react';
import { Heart, Sparkles, ShieldCheck, ArrowUp } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onNavigate: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t-2 border-[#FFD9E4] pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF8FAB] to-[#C77DFF] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-[#F65D8E]">
            May<span className="text-[#C77DFF]">Arts</span> ✦
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#8A7A84] max-w-sm mb-6">
          Ilustrações e marcas d’água personalizadas, feitas com muito amor e dedicação para valorizar sua marca.
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-[#4A3B47] mb-8">
          <button onClick={() => onNavigate('inicio')} className="hover:text-[#F65D8E] cursor-pointer">
            Início
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('como-funciona')} className="hover:text-[#F65D8E] cursor-pointer">
            Como Funciona
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('precos')} className="hover:text-[#F65D8E] cursor-pointer">
            Tabela de Preços
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('rastrear')} className="text-[#C77DFF] hover:underline cursor-pointer">
            Acompanhar Pedido (#ID)
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('faq')} className="hover:text-[#F65D8E] cursor-pointer">
            Dúvidas
          </button>
        </div>

        {/* Admin Access & Copyright */}
        <div className="w-full pt-6 border-t border-[#FFF0F5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7A84]">
          <div className="flex items-center gap-1">
            <span>May Arts © {new Date().getFullYear()} — Feito com</span>
            <Heart className="w-3.5 h-3.5 text-[#F65D8E] fill-current" />
          </div>

          <div className="flex items-center gap-4">
            <button
              id="footer-admin-btn"
              onClick={onOpenAdmin}
              className="hover:text-[#C77DFF] flex items-center gap-1 font-bold transition-colors cursor-pointer text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acesso da Artista (Admin)</span>
            </button>

            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-[#FFF0F5] hover:bg-[#FFE3EC] text-[#F65D8E] flex items-center justify-center transition-colors cursor-pointer"
              title="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
