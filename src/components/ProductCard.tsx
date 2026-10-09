import React from 'react';
import { Product } from '../data/catalog';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAskLea: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onAskLea,
}) => {
  return (
    <div className="group rounded-2xl border border-white/10 bg-[#131317] overflow-hidden flex flex-col transition-all duration-300 hover:border-[#b3192b]/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/60">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#b3192b]/90 backdrop-blur-md text-white text-[10px] font-serif-luxury tracking-widest uppercase">
            {product.badge}
          </div>
        )}

        {/* Installation Time */}
        {product.installationTime && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[#d4af37] text-[10px] font-medium">
            {product.installationTime}
          </div>
        )}

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
          <button
            onClick={() => onSelect(product)}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white text-neutral-100 hover:text-black transition-colors cursor-pointer"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAskLea(product)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#b3192b] hover:bg-[#c92a3e] text-white text-xs font-medium transition-colors cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demander à Léa</span>
          </button>
        </div>

        {/* Texture tag */}
        {product.texture && (
          <div className="absolute bottom-3 left-3 text-[11px] text-neutral-300 font-light">
            Texture : <span className="text-[#d4af37] font-medium">{product.texture}</span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="uppercase tracking-wider text-[10px]">
              {product.category === 'wig'
                ? 'Perruque'
                : product.category === 'extension'
                ? 'Extensions'
                : 'Soin Rituel'}
            </span>
            {product.length && <span>{product.length}</span>}
          </div>

          <h4
            onClick={() => onSelect(product)}
            className="font-serif-luxury text-lg text-white font-medium hover:text-[#d4af37] transition-colors cursor-pointer leading-snug line-clamp-1"
          >
            {product.name}
          </h4>

          <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2 font-light">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-base font-semibold text-white font-serif-luxury">
            {product.price} €
          </span>

          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#b3192b] text-neutral-200 hover:text-white border border-white/10 hover:border-transparent text-xs font-medium transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
