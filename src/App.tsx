import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { MaisonMalwiLogo } from './components/MaisonMalwiLogo';
import { VoiceSession } from './components/VoiceSession';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { CareGuideModal } from './components/CareGuideModal';
import { CATALOG, Product } from './data/catalog';
import {
  Sparkles,
  Crown,
  HeartHandshake,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Mic,
  Star,
} from 'lucide-react';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCareGuideOpen, setIsCareGuideOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'wig' | 'extension' | 'care'>('all');

  const voiceSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToVoice = () => {
    voiceSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleAskLea = (product: Product) => {
    scrollToVoice();
    // Pre-select product in modal or trigger prompt
    setSelectedProduct(product);
  };

  const filteredProducts = CATALOG.filter((p) => {
    if (catalogFilter === 'all') return true;
    return p.category === catalogFilter;
  });

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#f4efe8] flex flex-col selection:bg-[#9a1c2f] selection:text-white">
      {/* Top Header */}
      <Header
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCareGuide={() => setIsCareGuideOpen(true)}
        onScrollToVoice={scrollToVoice}
      />

      {/* HERO SECTION: The Crown of Luxury */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-gradient-to-b from-black via-[#0f0f13] to-[#0c0c0e]">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#b3192b]/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Main Brand Emblem matching reference photo */}
          <div className="mb-6 animate-fade-in">
            <MaisonMalwiLogo size="lg" showSlogan={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4af37] font-medium tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Votre Conseillère Vocale Intelligente & Experte Capillaire</span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-white font-medium tracking-tight leading-tight max-w-3xl">
            L’Excellence sur-mesure pour chaque chevelure, du type 1 à 4C.
          </h1>

          <p className="mt-5 text-sm sm:text-base text-neutral-300 max-w-2xl font-light leading-relaxed">
            Échangez de vive voix avec <strong className="text-white font-medium">Léa</strong>. 
            Elle analyse la texture de vos cheveux, vos habitudes et vos envies pour vous guider vers la perruque, 
            l’extension et le rituel de soin parfaitement adaptés.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={scrollToVoice}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#b3192b] to-[#800f1c] hover:from-[#c92a3e] hover:to-[#911222] text-white font-medium text-sm transition-all shadow-[0_4px_25px_rgba(179,25,43,0.4)] cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Démarrer la consultation avec Léa</span>
            </button>

            <button
              onClick={() => setIsCareGuideOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 hover:text-white font-medium text-sm transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              <span>Consulter le Guide d’Entretien</span>
            </button>
          </div>

          {/* Social Proof / Trust Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-8 border-t border-white/5 text-xs text-neutral-400">
            <div className="flex flex-col items-center">
              <Crown className="w-4 h-4 text-[#d4af37] mb-1" />
              <span className="text-white font-medium">100% Cheveux Vierge</span>
              <span className="text-[10px] text-neutral-500">Qualité Salon Paris</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-white font-medium">Tulle HD Invisible</span>
              <span className="text-[10px] text-neutral-500">Toutes carnations</span>
            </div>
            <div className="flex flex-col items-center">
              <HeartHandshake className="w-4 h-4 text-[#b3192b] mb-1" />
              <span className="text-white font-medium">Pose Express 3 min</span>
              <span className="text-[10px] text-neutral-500">Sans colle ni traction</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-4 h-4 text-[#d4af37] mb-1" />
              <span className="text-white font-medium">Rituels Sans Sulfates</span>
              <span className="text-[10px] text-neutral-500">Formules douces bio</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: VOICE DIAGNOSTIC WITH LÉA */}
      <section
        ref={voiceSectionRef}
        className="py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-[#0e0e12]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-medium block mb-2">
              Expérience Vocale Interactive
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-white font-medium">
              Votre Salon Virtuel avec Léa
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-light">
              Posez vos questions à l’oral en temps réel. Léa vous répond instantanément, 
              vous conseille avec bienveillance et vous suggère les meilleures pièces de la collection.
            </p>
          </div>

          <VoiceSession
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* SECTION: THE COLLECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-medium block mb-1">
              Haute Coiffure & Soins Précieux
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-white font-medium">
              La Collection Maison Malwi
            </h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'Toute la Collection' },
              { id: 'wig', label: 'Perruques & Half Wigs' },
              { id: 'extension', label: 'Extensions & Clip-ins' },
              { id: 'care', label: 'Rituels de Soin' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCatalogFilter(f.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  catalogFilter === f.id
                    ? 'bg-[#b3192b] text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
              onAddToCart={handleAddToCart}
              onAskLea={handleAskLea}
            />
          ))}
        </div>
      </section>

      {/* SECTION: MANIFESTO & EXPERTISE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-gradient-to-b from-[#0e0e12] to-black">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#b3192b] font-medium block mb-2">
              Notre Philosophie
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-white font-medium leading-snug">
              Sublimer chaque texture, célébrer chaque couronne.
            </h2>
            <p className="mt-4 text-sm text-neutral-300 font-light leading-relaxed">
              Chez Maison Malwi, nous croyons qu'une chevelure sublimée ne doit jamais se faire au détriment de la santé de vos propres cheveux.
              Que vous ayez des boucles 3C, un cheveu crépu 4C ou des ondulations soyeuses, nos perruques glueless et nos soins d'exception vous offrent la liberté absolue de changer de style en préservant votre fibre.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => setIsCareGuideOpen(true)}
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37] hover:underline cursor-pointer"
              >
                <span>Découvrir nos 4 piliers d’entretien</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/60 aspect-4/3 flex items-center justify-center p-8 text-center shadow-2xl">
            <div className="absolute inset-0 bg-radial from-[#b3192b]/20 via-transparent to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col items-center">
              <MaisonMalwiLogo size="md" showSlogan={true} />
              <p className="mt-6 font-serif-luxury italic text-sm text-neutral-300 max-w-xs">
                « Une véritable amie à vos côtés pour révéler la reine qui est en vous. »
              </p>
              <span className="mt-2 text-xs text-[#d4af37] font-medium tracking-wider">
                — Léa, Conseillère Maison Malwi
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/10 bg-black py-12 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <MaisonMalwiLogo size="sm" showSlogan={false} />
            <span className="text-neutral-400 font-serif-luxury text-sm">
              Maison Malwi • Paris
            </span>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-neutral-400">
              « Votre couronne, sans compromis. »
            </p>
            <p className="mt-1 text-[11px] text-neutral-600">
              © {new Date().getFullYear()} Maison Malwi. Tous droits réservés. Conseillère propulsée par Gemini 3.8 Live API.
            </p>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onAskLea={handleAskLea}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <CareGuideModal
        isOpen={isCareGuideOpen}
        onClose={() => setIsCareGuideOpen(false)}
        onAskLea={(topic) => {
          scrollToVoice();
        }}
      />
    </div>
  );
}
