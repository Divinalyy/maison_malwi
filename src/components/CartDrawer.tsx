import React from 'react';
import { Product } from '../data/catalog';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  if (!isOpen) return null;

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full bg-[#111115] border-l border-white/10 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#b3192b]" />
            <h3 className="font-serif-luxury text-lg text-white font-medium">
              Votre Panier Maison Malwi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <ShoppingBag className="w-12 h-12 text-neutral-600 mb-3" />
              <p className="font-serif-luxury text-lg text-neutral-300">
                Votre panier est vide
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                Faites un diagnostic vocal avec Léa pour trouver la perruque ou le rituel de soin idéal.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 p-3.5 rounded-xl bg-black/40 border border-white/5"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-18 h-18 rounded-lg object-cover bg-neutral-900 border border-white/10"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif-luxury text-sm text-white font-medium line-clamp-1">
                      {item.product.name}
                    </h4>
                    <span className="text-xs text-[#d4af37]">
                      {item.product.price} €
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 text-xs">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="text-neutral-400 hover:text-white px-1 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-white font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="text-neutral-400 hover:text-white px-1 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-black/40 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Total estimé :</span>
              <span className="font-serif-luxury text-2xl text-white font-semibold">
                {total} €
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#b3192b]/10 border border-[#b3192b]/20 flex items-center gap-2 text-[11px] text-neutral-300">
              <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>Livraison offerte & Guide d’entretien imprimé inclus.</span>
            </div>

            <button
              onClick={() => {
                alert('Merci pour votre commande chez Maison Malwi ! Léa prépare votre couronne.');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#b3192b] to-[#800f1c] hover:from-[#c92a3e] hover:to-[#911222] text-white font-medium text-sm transition-all shadow-lg cursor-pointer"
            >
              <span>Valider ma commande</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
