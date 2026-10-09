import React from 'react';
import { Product } from '../data/catalog';
import { X, Check, Sparkles, ShoppingBag, ShieldCheck, Clock, Heart } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAskLea: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onAskLea,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#121216] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-black/50 border border-white/10">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#b3192b] text-white text-xs font-serif-luxury uppercase tracking-wider">
                {product.badge}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-medium">
                Maison Malwi • Haute Coiffure
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-white font-medium mt-1">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 my-3">
                <span className="text-2xl font-serif-luxury font-semibold text-white">
                  {product.price} €
                </span>
                {product.installationTime && (
                  <span className="flex items-center gap-1 text-xs text-neutral-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                    {product.installationTime}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed font-light mb-4">
                {product.description}
              </p>

              {/* Specs */}
              <div className="space-y-2 mb-4 bg-black/40 p-3.5 rounded-xl border border-white/5 text-xs">
                {product.texture && (
                  <div className="flex justify-between text-neutral-300">
                    <span className="text-neutral-500">Texture :</span>
                    <span className="font-medium text-white">{product.texture}</span>
                  </div>
                )}
                {product.length && (
                  <div className="flex justify-between text-neutral-300">
                    <span className="text-neutral-500">Longueur :</span>
                    <span className="font-medium text-white">{product.length}</span>
                  </div>
                )}
                {product.density && (
                  <div className="flex justify-between text-neutral-300">
                    <span className="text-neutral-500">Densité :</span>
                    <span className="font-medium text-white">{product.density}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-300">
                  <span className="text-neutral-500">Textures adaptées :</span>
                  <span className="font-medium text-[#d4af37]">
                    {product.hairTypes.join(', ')}
                  </span>
                </div>
              </div>

              {/* Care Advice from Léa */}
              <div className="p-3.5 rounded-xl bg-[#b3192b]/15 border border-[#b3192b]/30 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e63946] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Le Conseil de Léa :</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {product.careAdvice}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  onClose();
                  onAskLea(product);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span>Poser une question à Léa</span>
              </button>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#b3192b] to-[#800f1c] hover:from-[#c92a3e] hover:to-[#911222] text-white text-xs font-medium transition-all shadow-lg cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ajouter au panier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
