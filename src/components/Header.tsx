import React from 'react';
import { ShoppingBag, Mic, BookOpen, Sparkles } from 'lucide-react';
import { MaisonMalwiLogo } from './MaisonMalwiLogo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenCareGuide: () => void;
  onScrollToVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenCareGuide,
  onScrollToVoice,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Navigation links - Left */}
        <div className="flex items-center gap-6">
          <button
            onClick={onScrollToVoice}
            className="hidden md:flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4 text-[#b3192b]" />
            <span>Diagnostic Vocal Léa</span>
          </button>

          <button
            onClick={onOpenCareGuide}
            className="hidden md:flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            <span>Rituels d'Entretien</span>
          </button>
        </div>

        {/* Brand Center Logo */}
        <div className="cursor-pointer">
          <MaisonMalwiLogo size="sm" showSlogan={false} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onScrollToVoice}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#b3192b] to-[#800f1c] hover:from-[#c92a3e] hover:to-[#911222] text-white text-xs font-medium transition-all shadow-[0_2px_12px_rgba(179,25,43,0.3)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Parler à Léa</span>
            <span className="sm:hidden">Léa</span>
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/10"
            title="Panier"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b3192b] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
