import type Ionicons from '@expo/vector-icons/Ionicons';

export type IconName = keyof typeof Ionicons.glyphMap;

export type PropertyType = 'apartment' | 'villa' | 'townhouse' | 'land' | 'commercial' | 'office';
export type Purpose = 'sale' | 'rent';
export type Goal = 'buy' | 'rent' | 'invest' | 'build';

export type AmenityKey =
  | 'parking' | 'pool' | 'gym' | 'security' | 'elevator' | 'garden'
  | 'view' | 'kids' | 'mall' | 'ac' | 'furnished' | 'smartHome'
  | 'storage' | 'concierge' | 'tennis' | 'clubhouse';

export interface Agent {
  name: string;
  phone: string;
  company: string;
  rating: number;
  deals: number;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  purpose: Purpose;
  price: number; // EGP (sale) or EGP/month (rent)
  city: string;
  compound?: string;
  area: number; // sqm
  rooms: number;
  bathrooms: number;
  floor?: number;
  amenities: AmenityKey[];
  images: string[];
  description: string;
  features: string[];
  finishing: string;
  paymentPlan?: string;
  delivery: 'ready' | 'under-construction';
  status: 'مميز' | 'جديد' | 'عاجل' | null;
  agent: Agent;
  yearBuilt?: number;
}

export type Timeline = 'immediate' | '3months' | '1year' | 'construction';
export type Payment = 'cash' | 'installments' | 'mortgage' | 'mixed';

export interface UserNeeds {
  goal: Goal;
  types: PropertyType[];
  budgetMin: number;
  budgetMax: number;
  cities: string[];
  areaMin: number;
  areaMax: number;
  rooms: number | null;
  amenities: AmenityKey[];
  timeline: Timeline;
  payment: Payment;
  priorities: string[];
}

export interface MatchResult {
  property: Property;
  score: number;
  reasons: string[];
}
