import type { Client, Order, Appointment, Measurement } from '../types';

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_ORDERS: Order[] = [];

export const MOCK_APPOINTMENTS_14_MAY: Appointment[] = [
  {
    id: 'apt1',
    time: '10:00',
    duration: '00:45',
    clientName: 'Kossi A.',
    type: 'Essayage',
    badgeLabel: 'RDV',
    colorCategory: 'purple',
    date: '2024-05-14',
  },
  {
    id: 'apt2',
    time: '12:00',
    duration: '01:00',
    clientName: 'Akouvi E.',
    type: 'Livraison',
    badgeLabel: 'Livraison',
    colorCategory: 'orange',
    date: '2024-05-14',
  },
  {
    id: 'apt3',
    time: '15:00',
    duration: '01:00',
    clientName: 'Jean P.',
    type: 'Rendez-vous',
    badgeLabel: 'RDV',
    colorCategory: 'red',
    date: '2024-05-14',
  },
  {
    id: 'apt4',
    time: '17:00',
    duration: '00:30',
    clientName: 'Komlan D.',
    type: 'Prise de mesures',
    badgeLabel: 'RDV',
    colorCategory: 'blue',
    date: '2024-05-14',
  },
];

export const MOCK_UPCOMING_EVENTS: Appointment[] = [
  {
    id: 'up1',
    time: '10:00',
    clientName: 'Afiwa B.',
    type: 'Essayage',
    garment: 'Chemise homme',
    badgeLabel: 'En cours',
    colorCategory: 'purple',
    date: '15 Mai',
  },
  {
    id: 'up2',
    time: '11:00',
    clientName: 'Yaovi M.',
    type: 'Rendez-vous',
    badgeLabel: 'RDV',
    colorCategory: 'purple',
    date: '16 Mai',
  },
];

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
