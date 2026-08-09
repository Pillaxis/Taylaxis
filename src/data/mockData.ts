import type { Client, Order, Appointment, Measurement } from '../types';

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_ORDERS: Order[] = [];

export const MOCK_APPOINTMENTS_14_MAY: Appointment[] = [];

export const MOCK_UPCOMING_EVENTS: Appointment[] = [];

export const MOCK_MEASUREMENTS_COSTUME: Measurement[] = [
  { id: 'm1', label: 'Tour de poitrine', valueCm: 102, iconName: 'Shirt' },
  { id: 'm2', label: 'Tour de taille', valueCm: 92, iconName: 'Ruler' },
  { id: 'm3', label: 'Tour de hanches', valueCm: 98, iconName: 'Activity' },
  { id: 'm4', label: 'Largeur d\'épaules', valueCm: 45, iconName: 'Maximize2' },
  { id: 'm5', label: 'Longueur de manche', valueCm: 62, iconName: 'MoveDown' },
  { id: 'm6', label: 'Tour de cou', valueCm: 41, iconName: 'Circle' },
  { id: 'm7', label: 'Longueur de veste', valueCm: 75, iconName: 'ArrowUpUp' },
  { id: 'm8', label: 'Longueur pantalon', valueCm: 103, iconName: 'Sliders' },
  { id: 'm9', label: 'Entrejambe', valueCm: 78, iconName: 'Scissors' },
  { id: 'm10', label: 'Tour de cuisse', valueCm: 60, iconName: 'Compass' },
];

export const MOCK_MEASUREMENTS_CHEMISE: Measurement[] = [
  { id: 'mc1', label: 'Tour de cou', valueCm: 41, iconName: 'Circle' },
  { id: 'mc2', label: 'Tour de poitrine', valueCm: 100, iconName: 'Shirt' },
  { id: 'mc3', label: 'Longueur de manche', valueCm: 63, iconName: 'MoveDown' },
  { id: 'mc4', label: 'Tour de poignet', valueCm: 19, iconName: 'Ruler' },
  { id: 'mc5', label: 'Largeur d\'épaules', valueCm: 45, iconName: 'Maximize2' },
  { id: 'mc6', label: 'Longueur totale chemise', valueCm: 74, iconName: 'ArrowUpUp' },
];

export const MOCK_MEASUREMENTS_PANTALON: Measurement[] = [
  { id: 'mp1', label: 'Tour de ceinture (taille)', valueCm: 88, iconName: 'Ruler' },
  { id: 'mp2', label: 'Tour de bassin (hanches)', valueCm: 97, iconName: 'Activity' },
  { id: 'mp3', label: 'Longueur totale pantalon', valueCm: 102, iconName: 'Sliders' },
  { id: 'mp4', label: 'Entrejambe', valueCm: 77, iconName: 'Scissors' },
  { id: 'mp5', label: 'Tour de cuisse', valueCm: 59, iconName: 'Compass' },
  { id: 'mp6', label: 'Largeur du bas', valueCm: 19, iconName: 'Maximize2' },
];

export const MOCK_MEASUREMENTS_ROBE: Measurement[] = [
  { id: 'mr1', label: 'Tour de poitrine', valueCm: 92, iconName: 'Shirt' },
  { id: 'mr2', label: 'Tour sous-poitrine', valueCm: 78, iconName: 'Circle' },
  { id: 'mr3', label: 'Tour de taille', valueCm: 74, iconName: 'Ruler' },
  { id: 'mr4', label: 'Tour de hanches', valueCm: 100, iconName: 'Activity' },
  { id: 'mr5', label: 'Hauteur taille-sol', valueCm: 110, iconName: 'MoveDown' },
  { id: 'mr6', label: 'Longueur totale robe', valueCm: 145, iconName: 'ArrowUpUp' },
];

export const MOCK_MEASUREMENTS_BOUBOU: Measurement[] = [
  { id: 'mb1', label: 'Longueur totale boubou', valueCm: 150, iconName: 'ArrowUpUp' },
  { id: 'mb2', label: 'Largeur d\'envergure (manche à manche)', valueCm: 160, iconName: 'Maximize2' },
  { id: 'mb3', label: 'Ouverture de cou', valueCm: 48, iconName: 'Circle' },
  { id: 'mb4', label: 'Longueur pantalon intérieur', valueCm: 105, iconName: 'Sliders' },
  { id: 'mb5', label: 'Tour de taille pantalon', valueCm: 90, iconName: 'Ruler' },
];

export const GARMENT_TYPES = [
  { id: 'Costume 3 Pièces', name: 'Costume 3P', icon: '👔' },
  { id: 'Costume 2 Pièces', name: 'Costume 2P', icon: '🤵' },
  { id: 'Pantalon classique', name: 'Pantalon', icon: '👖' },
  { id: 'Chemise Manche Longue', name: 'Chemise ML', icon: '👕' },
  { id: 'Chemise Manche Courte', name: 'Chemise MC', icon: '🎽' },
  { id: 'Boubou / Agbada', name: 'Boubou', icon: '🥻' },
  { id: 'Habits traditionnels', name: 'Traditionnel', icon: '✨' },
  { id: 'Veste / Blazer', name: 'Veste', icon: '🧥' },
  { id: 'Robe / Ensemble Dame', name: 'Robe Dame', icon: '👗' },
  { id: 'Autre vêtement (Personnalisé)', name: 'Sur Mesure', icon: '📏' },
];

export const GARMENT_TYPE_PRESETS: Record<string, { label: string; placeholder: string }[]> = {
  'Costume 3 Pièces': [
    { label: 'Tour de poitrine', placeholder: 'ex: 98' },
    { label: 'Carrure épaules', placeholder: 'ex: 46' },
    { label: 'Longueur veste', placeholder: 'ex: 75' },
    { label: 'Longueur manche', placeholder: 'ex: 64' },
    { label: 'Tour de taille pantalon', placeholder: 'ex: 84' },
    { label: 'Tour de hanches', placeholder: 'ex: 100' },
    { label: 'Hauteur entrejambe', placeholder: 'ex: 80' },
    { label: 'Longueur pantalon', placeholder: 'ex: 104' },
  ],
  'Costume 2 Pièces': [
    { label: 'Tour de poitrine', placeholder: 'ex: 98' },
    { label: 'Carrure épaules', placeholder: 'ex: 46' },
    { label: 'Longueur veste', placeholder: 'ex: 74' },
    { label: 'Longueur manche', placeholder: 'ex: 63' },
    { label: 'Tour de taille pantalon', placeholder: 'ex: 84' },
    { label: 'Longueur pantalon', placeholder: 'ex: 104' },
  ],
  'Pantalon classique': [
    { label: 'Tour de taille', placeholder: 'ex: 84' },
    { label: 'Tour de hanches', placeholder: 'ex: 100' },
    { label: 'Tour de cuisse', placeholder: 'ex: 58' },
    { label: 'Hauteur entrejambe', placeholder: 'ex: 80' },
    { label: 'Longueur pantalon', placeholder: 'ex: 105' },
    { label: 'Tour de bas / cheville', placeholder: 'ex: 38' },
  ],
  'Chemise Manche Longue': [
    { label: 'Tour de col', placeholder: 'ex: 40' },
    { label: 'Tour de poitrine', placeholder: 'ex: 96' },
    { label: 'Carrure épaules', placeholder: 'ex: 46' },
    { label: 'Longueur chemise', placeholder: 'ex: 72' },
    { label: 'Longueur manche', placeholder: 'ex: 64' },
    { label: 'Tour de poignet', placeholder: 'ex: 22' },
  ],
  'Chemise Manche Courte': [
    { label: 'Tour de col', placeholder: 'ex: 40' },
    { label: 'Tour de poitrine', placeholder: 'ex: 96' },
    { label: 'Carrure épaules', placeholder: 'ex: 46' },
    { label: 'Longueur chemise', placeholder: 'ex: 72' },
    { label: 'Longueur manche courte', placeholder: 'ex: 24' },
    { label: 'Tour de bras', placeholder: 'ex: 34' },
  ],
  'Boubou / Agbada': [
    { label: 'Carrure épaules', placeholder: 'ex: 52' },
    { label: 'Longueur boubou', placeholder: 'ex: 145' },
    { label: 'Largeur manche', placeholder: 'ex: 35' },
    { label: 'Tour de cou / col', placeholder: 'ex: 42' },
    { label: 'Longueur pantalon', placeholder: 'ex: 105' },
  ],
  'Habits traditionnels': [
    { label: 'Tour de poitrine', placeholder: 'ex: 98' },
    { label: 'Carrure épaules', placeholder: 'ex: 48' },
    { label: 'Longueur tunique', placeholder: 'ex: 90' },
    { label: 'Tour de taille', placeholder: 'ex: 86' },
    { label: 'Longueur pantalon', placeholder: 'ex: 104' },
  ],
  'Veste / Blazer': [
    { label: 'Tour de poitrine', placeholder: 'ex: 98' },
    { label: 'Carrure épaules', placeholder: 'ex: 46' },
    { label: 'Longueur veste', placeholder: 'ex: 74' },
    { label: 'Longueur manche', placeholder: 'ex: 63' },
    { label: 'Tour de hanches', placeholder: 'ex: 102' },
  ],
  'Robe / Ensemble Dame': [
    { label: 'Tour de poitrine', placeholder: 'ex: 90' },
    { label: 'Tour sous-poitrine', placeholder: 'ex: 76' },
    { label: 'Tour de taille', placeholder: 'ex: 72' },
    { label: 'Tour de hanches', placeholder: 'ex: 98' },
    { label: 'Longueur épaule-taille', placeholder: 'ex: 42' },
    { label: 'Longueur totale robe', placeholder: 'ex: 135' },
  ],
  'Autre vêtement (Personnalisé)': [
    { label: 'Longueur vêtement', placeholder: 'ex: 100' },
    { label: 'Largeur / Tour', placeholder: 'ex: 90' },
  ],
};
