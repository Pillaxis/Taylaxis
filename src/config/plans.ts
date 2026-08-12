export interface PlanConfig {
  id: 'FREE' | 'PRO';
  name: string;
  priceFCFA: number;
  priceFormatted: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export const TAYLAXIS_PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Gratuit',
    priceFCFA: 0,
    priceFormatted: '0 FCFA/mois',
    period: 'mensuel',
    description: 'Pour gérer vos clients et leurs mensurations',
    features: [
      'Ajouter et gérer des clients',
      'Enregistrer et consulter les mensurations des clients',
    ],
  },
  {
    id: 'PRO',
    name: 'Taylaxis Pro',
    priceFCFA: 5000,
    priceFormatted: '5 000 FCFA/mois',
    period: 'mensuel',
    description: 'Inclut toutes les fonctionnalités du forfait Gratuit +',
    features: [
      'Ajouter et gérer les commandes',
      'Planifier et gérer les rendez-vous',
      'Relancer les clients',
    ],
    isPopular: true,
  },
];

export const getPlanConfig = (id: 'FREE' | 'PRO' | string): PlanConfig => {
  const found = TAYLAXIS_PLANS.find((p) => p.id === id || p.id.toLowerCase() === id.toLowerCase());
  return found || TAYLAXIS_PLANS[0];
};
