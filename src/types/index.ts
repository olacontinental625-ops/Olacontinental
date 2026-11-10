export type PageType = 'home' | 'about' | 'properties' | 'corridors' | 'verification' | 'testimonials' | 'contact';

export type PropertyPurpose = 'All' | 'Buy' | 'Rent' | 'Lease' | 'Invest';

export type PropertyType = 'All' | 'House' | 'Student Hostel' | 'Apartment' | 'Land' | 'Commercial Property';

export type Corridor =
  | 'All Corridors'
  | 'Behind LAUTECH Teaching Hospital'
  | 'Under G'
  | 'Adenike'
  | 'Mushin Commercial Corridor'
  | 'Aroje'
  | 'Takie'
  | 'Odo-Oba';

export interface Property {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  purpose: 'Buy' | 'Rent' | 'Lease' | 'Invest';
  type: 'House' | 'Student Hostel' | 'Apartment' | 'Land' | 'Commercial Property';
  corridor: 'Behind LAUTECH Teaching Hospital' | 'Under G' | 'Adenike' | 'Mushin Commercial Corridor' | 'Aroje' | 'Takie' | 'Odo-Oba';
  address: string;
  price: number;
  priceDisplay: string;
  pricePeriod?: string;
  bedrooms?: number;
  bathrooms?: number;
  units?: number;
  landSize: string;
  titleType: string;
  beaconCoordinates: string;
  images: string[];
  featuredImage: string;
  videoTourUrl?: string;
  youtubeId?: string;
  amenities: string[];
  dueDiligenceNotes: string[];
  legalFeeEstimated: number;
  agencyFee: number;
  cadastralChartingEstimated: number;
  status: 'Available' | 'Sold Benchmark' | 'Rented Benchmark';
  inspectionSchedule: string;
  rentalYieldPercent?: number;
  yearBuiltOrDeveloped?: number;
  suitableFor: string[];
}

export interface InspectionReview {
  id: string;
  propertyId: string;
  clientName: string;
  rating: number;
  inspectionDate: string;
  comment: string;
  verified: boolean;
}

export interface LeadSubmission {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  purpose: string;
  propertyType: string;
  corridor: string;
  budget: string;
  message?: string;
  createdAt?: string;
  status?: string;
}

export interface ViewingRequest {
  id?: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  phone: string;
  email?: string;
  preferredDate: string;
  inspectionType: string;
  notes?: string;
  createdAt?: string;
  status?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
