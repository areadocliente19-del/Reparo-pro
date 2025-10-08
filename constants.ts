import { Quote, Service, Material } from './types';

export const initialQuote: Quote = {
  id: '',
  createdAt: 0,
  status: 'pending',
  customer: { name: '', phone: '', email: '' },
  vehicle: { make: '', model: '', year: '', color: '', plate: '' },
  photos: [],
  damagedParts: {},
  paymentMethod: '',
};

export const LABOR_COST_PER_HOUR = 75;
export const CREDIT_CARD_FEE_PERCENTAGE = 4.99;

export const PAYMENT_METHODS = [
    { id: 'pix', name: 'PIX' },
    { id: 'debit', name: 'Cartão de Débito' },
    { id: 'credit', name: 'Cartão de Crédito' }
];


export const AVAILABLE_SERVICES: Omit<Service, 'id' | 'laborHours' | 'costPerHour'>[] = [
  { name: 'Desamassar (Pequeno)', type: 'bodywork' },
  { name: 'Desamassar (Grande)', type: 'bodywork' },
  { name: 'Solda Plástica', type: 'bodywork' },
  { name: 'Alinhamento de Painel', type: 'bodywork' },
  { name: 'Aplicação de Massa', type: 'prep' },
  { name: 'Lixamento', type: 'prep' },
  { name: 'Aplicação de Primer', type: 'prep' },
  { name: 'Pintura (Base)', type: 'paint' },
  { name: 'Aplicação de Verniz', type: 'paint' },
  { name: 'Polimento', type: 'finishing' },
  { name: 'Espelhamento', type: 'finishing' },
];

export const AVAILABLE_MATERIALS: Omit<Material, 'id' | 'quantity' | 'unitCost'>[] = [
    { name: 'Tinta (ml)' },
    { name: 'Verniz (ml)' },
    { name: 'Primer (ml)' },
    { name: 'Massa Poliéster (g)' },
    { name: 'Lixa (unidade)' },
    { name: 'Fita Crepe (rolo)' },
    { name: 'Desengraxante (ml)' },
];

export const CAR_PARTS = [
    { id: 'front-bumper', name: 'Para-choque Dianteiro' },
    { id: 'hood', name: 'Capô' },
    { id: 'front-left-fender', name: 'Para-lama Dianteiro Esquerdo' },
    { id: 'front-right-fender', name: 'Para-lama Dianteiro Direito' },
    { id: 'front-left-door', name: 'Porta Dianteira Esquerda' },
    { id: 'front-right-door', name: 'Porta Dianteira Direita' },
    { id: 'rear-left-door', name: 'Porta Traseira Esquerda' },
    { id: 'rear-right-door', name: 'Porta Traseira Direita' },
    { id: 'roof', name: 'Teto' },
    { id: 'trunk', name: 'Porta-malas' },
    { id: 'rear-bumper', name: 'Para-choque Traseiro' },
    { id: 'rear-left-fender', name: 'Para-lama Traseiro Esquerdo' },
    { id: 'rear-right-fender', name: 'Para-lama Traseiro Direito' },
    { id: 'left-rocker-panel', name: 'Saia Lateral Esquerda'},
    { id: 'right-rocker-panel', name: 'Saia Lateral Direita'},
];