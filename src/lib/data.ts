import { PlaceHolderImages } from './placeholder-images';

export interface Equipment {
  id: string;
  name: string;
  type: 'Tractor' | 'Rotavator' | 'Plow' | 'Harvester' | 'Sprayer' | 'General Farm Equipment';
  description: string;
  owner: string; // This is for display, ownerId will be the UID
  ownerId: string;
  village: string;
  distance?: number; // in km - will be calculated dynamically
  travelTime?: number; // in minutes - will be calculated dynamically
  verified: boolean;
  price: {
    perHour?: number;
    perDay?: number;
  };
  latitude: number;
  longitude: number;
  geohash: string;
  availabilityStatus: 'available' | 'maintenance';
  imageUrl: string;
  imageHint: string;
}

export interface Booking {
    id: string;
    equipmentId: string;
    ownerId: string;
    createdBy: string;
    beneficiary: string;
    sahayakId?: string;
    driverId?: string;
    commissionEligible: boolean;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
    totalAmount: number;
    sahayakCommission?: number;
    platformFee?: number;
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}
