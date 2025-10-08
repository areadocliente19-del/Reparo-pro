export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: string;
  color: string;
  plate: string;
}

export interface Photo {
  name: string;
  url: string;
}

export interface Service {
  id: string;
  name: string;
  type: 'bodywork' | 'prep' | 'paint' | 'finishing';
  laborHours: number;
  costPerHour: number;
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface DamagedPart {
  partId: string;
  partName: string;
  services: Service[];
  replacementParts: Part[];
  materials: Material[];
}

export type PaymentMethod = 'pix' | 'debit' | 'credit' | '';

export interface TimelineEvent {
  id: string;
  date: number;
  description: string;
  status: string;
  photoUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'workshop';
  text: string;
  timestamp: number;
}

export type UserRole = 'admin' | 'estimator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be a hash
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin?: number;
}

export interface Quote {
  id: string;
  createdAt: number;
  createdById?: string;
  createdByName?: string;
  approvedAt?: number;
  osGeneratedAt?: number;
  status: 'pending' | 'approved' | 'denied' | 'os-generated' | 'em-andamento' | 'concluido';
  customer: Customer;
  vehicle: Vehicle;
  photos: Photo[];
  damagedParts: {
    [key: string]: DamagedPart;
  };
  paymentMethod: PaymentMethod;
  signature?: string;
  signedAt?: number;
  termsAndConditions?: string;
  // Customer Portal fields
  customerPortalToken?: string;
  timeline?: TimelineEvent[];
  chat?: ChatMessage[];
}