export interface Product {
  id: string;
  name: string;
  category: 'wig' | 'extension' | 'care' | 'accessory';
  texture?: 'Straight' | 'Body Wave' | 'Deep Wave' | 'Kinky Curly' | 'Kinky Straight';
  hairTypes: string[]; // e.g. ["3C", "4A", "4B", "4C"]
  price: number;
  length?: string;
  density?: string;
  badge?: string;
  description: string;
  installationTime?: string;
  keyBenefits: string[];
  image: string;
  careAdvice: string;
}

export const CATALOG: Product[] = [
  {
    id: 'half-wig-kinky-curly',
    name: 'Half Wig « Couronne Divine » Kinky Curly',
    category: 'wig',
    texture: 'Kinky Curly',
    hairTypes: ['3C', '4A', '4B', '4C'],
    price: 189,
    length: '20 pouces (50 cm)',
    density: '180% haute densité',
    badge: 'Coup de Cœur Léa',
    description: 'Pose éclair en moins de 3 minutes sans colle. Conçue avec peignes ergonomiques et cordon réglable pour se fondre à merveille avec votre leave-out naturel.',
    installationTime: '3 minutes chrono',
    keyBenefits: [
      'Zéro colle ni gel requis',
      'Fusion indétectable avec le cheveu afro & bouclé',
      'Laisse respirer votre ligne frontale',
      '100% Cheveux Vierge de Haute Qualité',
    ],
    image: '/src/assets/images/half_wig_kinky_curly_1791534894341.jpg',
    careAdvice: 'Démêlez toujours aux doigts ou avec notre brosse flexi sur cheveux humides imprégnés de Conditioner. Laissez sécher à l’air libre.',
  },
  {
    id: 'lace-frontal-body-wave',
    name: 'Perruque Lace Frontal 13x4 Body Wave Royale',
    category: 'wig',
    texture: 'Body Wave',
    hairTypes: ['1A', '2A', '2B', '3A', '3B', '3C', '4A', '4B', '4C'],
    price: 295,
    length: '24 pouces (60 cm)',
    density: '200% volume salon',
    badge: 'Élégance Signature',
    description: 'Dentelle HD suisse ultra-fine invisible sur toutes les carnations. Ondulations hollywoodiennes souples et soyeuses, ligne frontale pré-plucked avec baby hairs naturels.',
    installationTime: 'Pose collée ou glueless',
    keyBenefits: [
      'Tulle HD Real-Skin transparente',
      'Raie libre complète d’une oreille à l’autre',
      'Mouvement rebondissant naturel',
      'Résiste aux brushings et bouclages',
    ],
    image: '/src/assets/images/body_wave_lace_frontal_1791534910785.jpg',
    careAdvice: 'Appliquez 2 gouttes de notre Sérum Thermoprotecteur avant tout passage d’appareil chauffant. Dormez impérativement avec un bonnet en soie.',
  },
  {
    id: 'clipins-kinky-straight',
    name: 'Clip-ins « Brushing Impérial » Kinky Straight',
    category: 'extension',
    texture: 'Kinky Straight',
    hairTypes: ['3B', '3C', '4A', '4B', '4C'],
    price: 165,
    length: '18 & 22 pouces (160g)',
    density: 'Pack 8 bandes complètes',
    badge: 'Volume Immédiat',
    description: 'Imite avec une précision bluffante le brushing soyeux d’un cheveu crépu ou frisé étiré sans défrisage. Clips doublés de silicone pour protéger les racines.',
    installationTime: '5 minutes',
    keyBenefits: [
      'Volume et longueur sans abîmer les longueurs',
      'Texture mimétique bluffante',
      'Clips ultra-confortables anti-glisse',
      'Facile à coiffer en chignon ou queue de cheval haute',
    ],
    image: '/src/assets/images/clipins_kinky_straight_1791534946663.jpg',
    careAdvice: 'Lavez les bandes à plat dans de l’eau tiède avec notre Shampoing Doux. Évitez de frotter excessivement.',
  },
  {
    id: 'elixir-royal-oil',
    name: 'Huile Précieuse Élixir Royal (100ml)',
    category: 'care',
    hairTypes: ['1A', '2A', '3A', '3B', '3C', '4A', '4B', '4C'],
    price: 28,
    badge: 'Soin Culte',
    description: 'Alliance précieuse d’huile de Baobab bio, de Ricin noir de Madagascar et d’Argan vierge. Nourrit la fibre en profondeur, scelle l’hydratation et sublime la brillance.',
    keyBenefits: [
      'Fini satiné sans sensation de gras',
      'Scelle l’hydratation des pointes',
      'Fortifie la racine et prévient la casse',
      'Parfum signature floral boisé délicat',
    ],
    image: '/src/assets/images/luxury_hair_elixir_1791534927147.jpg',
    careAdvice: 'Chauffez 3 gouttes au creux des mains et appliquez sur les longueurs et pointes le matin ou avant la pose de votre bonnet de nuit.',
  },
  {
    id: 'lace-closure-deep-wave',
    name: 'Perruque Lace Closure 5x5 Deep Wave Mystique',
    category: 'wig',
    texture: 'Deep Wave',
    hairTypes: ['2C', '3A', '3B', '3C', '4A', '4B'],
    price: 245,
    length: '20 pouces',
    density: '180% densité',
    badge: 'Prête à Porter',
    description: 'Boucles profondes sculptées et rebondissantes. La closure 5x5 offre un entretien minimal et peut se porter 100% glueless au quotidien.',
    installationTime: 'Pose express sans colle',
    keyBenefits: [
      'Boucles texturées ultra-définies',
      'Entretien très facile au spray hydratant',
      'Bonnet ergonomique respirant',
    ],
    image: '/src/assets/images/half_wig_kinky_curly_1791534894341.jpg',
    careAdvice: 'Rafraîchissez les boucles le matin avec un vaporisateur d’eau florale mélangé à une noisette de Conditioner.',
  },
  {
    id: 'shampoo-conditioner-duo',
    name: 'Duo Rituel Lavant Doux & Démêlant Kératine',
    category: 'care',
    hairTypes: ['Toutes textures'],
    price: 45,
    badge: 'Indispensable Entretien',
    description: 'Formule sans sulfates, sans silicones lourds et sans parabènes. Respecte la cuticule délicate des extensions et préserve la douceur soyeuse.',
    keyBenefits: [
      'Préserve la souplesse naturelle',
      'Démêlage instantané sans traction',
      'Prolonge la longévité de vos perruques et extensions',
    ],
    image: '/src/assets/images/luxury_hair_elixir_1791534927147.jpg',
    careAdvice: 'Faites un lavage tous les 10 à 15 jours pour les perruques, toujours à l’eau tiède de la racine vers les pointes.',
  },
];
