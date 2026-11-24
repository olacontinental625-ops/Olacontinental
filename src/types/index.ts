export type PageType =
  | 'home'
  | 'about'
  | 'properties'
  | 'corridors'
  | 'testimonials'
  | 'constructions'
  | 'blogs'
  | 'customer-login'
  | 'admin-login';

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

export type BlogCategory =
  | 'All'
  | 'Land Verification & Legal'
  | 'Student Hostel ROI'
  | 'Civil Construction'
  | 'Diaspora Guide'
  | 'Market Intelligence';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  category: Exclude<BlogCategory, 'All'>;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  coverImage: string;
  corridorTag: string;
  featured?: boolean;
  tags: string[];
}

export interface ContactInquiry {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  serviceType: string;
  corridor: string;
  budget: string;
  message: string;
  createdAt?: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  whatsapp: string;
  createdAt: string;
  source: string;
  status?: string;
}

export interface ConstructionProject {
  id: string;
  title: string;
  category: 'ongoing' | 'finished';
  location: string;
  phaseOrType: string;
  specs: string;
  completionLabel: string;
  image: string;
  description: string;
  createdAt?: string;
}

