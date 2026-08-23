import React from 'react';
import { Sparkles, Search, PlusCircle, ShieldCheck, Heart, Menu, X } from 'lucide-react';
import { SiteSettings } from '../types';

interface NavbarProps {
  settings: SiteSettings;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdminOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeSection,
  onNavigate,
  onOpenAdmin,
  isAdminOpen,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#FFD9E4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF8FAB] to-[#C77DFF] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xl tracking-tight text-[#F65D8E] flex items-center gap-1">
                May<span className="text-[#C77DFF]">Arts</span>
                <span className="text-xs text-[#FF8FAB]">✦</span>
              </div>
              <p className="text-[11px] text-[#8A7A84] font-medium leading-none">Comissões & Ilustrações</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              id="nav-link-como-funciona"
              onClick={() => handleNavClick('como-funciona')}
              className="px-3.5 py-2 text-sm font-semibold text-[#4A3B47] hover:text-[#F65D8E] rounded-full hover:bg-[#FFF0F5] transition-colors cursor-pointer"
            >
              Como funciona
            </button>
            <button
              id="nav-link-precos"
              onClick={() => handleNavClick('precos')}
              className="px-3.5 py-2 text-sm font-semibold text-[#4A3B47] hover:text-[#F65D8E] rounded-full hover:bg-[#FFF0F5] transition-colors cursor-pointer"
            >
              Preços & Pacotes
            </button>
            <button
              id="nav-link-rastrear"
              onClick={() => handleNavClick('rastrear')}
              className="px-3.5 py-2 text-sm font-semibold text-[#795290] hover:text-[#C77DFF] rounded-full hover:bg-[#F7EEFF] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#C77DFF]" />
              Acompanhar Pedido
            </button>
            <button
              id="nav-link-faq"
              onClick={() => handleNavClick('faq')}
              className="px-3.5 py-2 text-sm font-semibold text-[#4A3B47] hover:text-[#F65D8E] rounded-full hover:bg-[#FFF0F5] transition-colors cursor-pointer"
            >
              Dúvidas
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              id="nav-admin-toggle-btn"
              onClick={onOpenAdmin}
              className={`px-3 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer border ${
                isAdminOpen
                  ? 'bg-[#C77DFF] text-white border-[#C77DFF] shadow-sm'
                  : 'bg-white text-[#8A7A84] border-[#FFD9E4] hover:text-[#F65D8E] hover:border-[#FF8FAB]'
              }`}
              title="Área Administrativa da May"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdminOpen ? 'Área da May Ativa' : 'Área da May'}</span>
            </button>

            <button
              id="nav-cta-fazer-pedido"
              onClick={() => handleNavClick('pedido')}
              className="bg-[#F65D8E] hover:bg-[#FF8FAB] text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Fazer Pedido</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="mobile-admin-btn"
              onClick={onOpenAdmin}
              className="p-2 rounded-xl text-[#8A7A84] hover:text-[#F65D8E] hover:bg-[#FFF0F5]"
              title="Área da May"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#4A3B47] hover:bg-[#FFF0F5] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#FFD9E4] flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('como-funciona')}
              className="px-4 py-2.5 text-left text-sm font-semibold text-[#4A3B47] hover:bg-[#FFF0F5] rounded-xl"
            >
              Como funciona
            </button>
            <button
              onClick={() => handleNavClick('precos')}
              className="px-4 py-2.5 text-left text-sm font-semibold text-[#4A3B47] hover:bg-[#FFF0F5] rounded-xl"
            >
              Preços & Pacotes
            </button>
            <button
              onClick={() => handleNavClick('rastrear')}
              className="px-4 py-2.5 text-left text-sm font-semibold text-[#C77DFF] bg-[#F7EEFF]/60 rounded-xl flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Acompanhar Pedido
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="px-4 py-2.5 text-left text-sm font-semibold text-[#4A3B47] hover:bg-[#FFF0F5] rounded-xl"
            >
              Dúvidas
            </button>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('pedido')}
                className="w-full bg-[#F65D8E] text-white font-bold text-center py-3 rounded-xl shadow-sm"
              >
                Fazer um pedido 💌
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
