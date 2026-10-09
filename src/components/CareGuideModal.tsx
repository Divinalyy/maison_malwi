import React from 'react';
import { X, Sparkles, Droplets, Wind, ShieldAlert, Moon, Check } from 'lucide-react';

interface CareGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskLea: (topic: string) => void;
}

export const CareGuideModal: React.FC<CareGuideModalProps> = ({
  isOpen,
  onClose,
  onAskLea,
}) => {
  if (!isOpen) return null;

  const rituals = [
    {
      icon: <Droplets className="w-5 h-5 text-[#d4af37]" />,
      title: '1. Lavage Doux & Hydratation',
      desc: 'Lavez votre perruque ou extensions tous les 10 à 15 jours à l’eau tiède avec notre Shampoing Doux sans sulfates. Ne frottez jamais en boule : faites glisser la mousse des racines vers les pointes.',
      tip: 'Toujours laisser poser le Masque Nourrissant 15 minutes pour restaurer l’élasticité de la cuticule.',
    },
    {
      icon: <Wind className="w-5 h-5 text-emerald-400" />,
      title: '2. Séchage à l’Air Libre',
      desc: 'Après le rinçage, épongez délicatement avec une serviette en microfibre sans essorer. Posez la perruque sur un support aéré et laissez sécher naturellement.',
      tip: 'Le séchage à l’air libre préserve la brillance originelle des boucles et prolonge la durée de vie de plus d’un an.',
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-[#b3192b]" />,
      title: '3. Protection Thermique 230°C',
      desc: 'Si vous réalisez un lissage ou un bouclage au fer, vaporisez impérativement 2 pressions de Sérum Thermoprotecteur Maison Malwi. Ne dépassez jamais 180°C sur des mèches vierges.',
      tip: 'Le cheveu vierge réagit exactement comme le cheveu humain naturel : la chaleur excessive le dessèche sans protection.',
    },
    {
      icon: <Moon className="w-5 h-5 text-purple-400" />,
      title: '4. Rituel Nocturne en Soie',
      desc: 'Pour les poses fixes (Frontal, Tape-ins, Tissages), attachez vos longueurs en tresse lâche et enfilez notre Bonnet en Pure Soie de Mûrier 22 Momme.',
      tip: 'La soie évite 98% des frottements et retient l’hydratation naturelle de vos cheveux.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#d4af37]" />
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-medium">
            Guide d'Excellence Maison Malwi
          </span>
        </div>

        <h2 className="font-serif-luxury text-2xl sm:text-3xl text-white font-medium mb-2">
          L’Art d'Entretenir Votre Couronne
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed mb-6 font-light">
          Les extensions et perruques Maison Malwi sont confectionnées à partir de mèches humaines d’une pureté rare. Voici les 4 gestes fondamentaux recommandés par Léa pour garder une chevelure sublime au fil des mois.
        </p>

        <div className="space-y-4">
          {rituals.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  {r.icon}
                </div>
                <h4 className="font-serif-luxury text-base text-white font-medium">
                  {r.title}
                </h4>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-light pl-11">
                {r.desc}
              </p>
              <div className="ml-11 p-2 rounded-lg bg-[#b3192b]/10 border border-[#b3192b]/20 text-[11px] text-neutral-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#b3192b] shrink-0" />
                <span>
                  <strong>Astuce de Léa :</strong> {r.tip}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-xs text-neutral-400">
            Une question spécifique sur votre perruque ?
          </span>
          <button
            onClick={() => {
              onClose();
              onAskLea('Comment entretenir et laver ma perruque pour qu’elle dure plus d’un an ?');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#b3192b] to-[#800f1c] text-white text-xs font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demander conseil à Léa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
