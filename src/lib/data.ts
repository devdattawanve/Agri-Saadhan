import { PlaceHolderImages } from './placeholder-images';
import type { Timestamp } from 'firebase/firestore';

export interface Equipment {
  id: string;
  name: string;
  type: 'Tractor' | 'Rotavator' | 'Plow' | 'Harvester' | 'Sprayer' | 'General Farm Equipment';
  description: string;
  owner?: string; // This is for display, ownerId will be the UID
  ownerId: string;
  village: string;
  distance?: number; // in km - will be calculated dynamically
  travelTime?: number; // in minutes - will be calculated dynamically
  verified: boolean;
  price: {
    perHour?: number;
    perDay?: number;
  };
  driverChargePerHour?: number;
  deliveryFee?: number;
  latitude: number;
  longitude: number;
  geohash: string;
  availabilityStatus: 'available' | 'maintenance';
  imageUrl: string;
  imageHint: string;
  createdAt: Timestamp;
}

export interface Booking {
    id: string;
    equipmentId: string;
    equipmentName: string;
    equipmentImageUrl: string;
    ownerId: string;
    createdBy: string;
    beneficiary: string;
    sahayakId?: string;
    driverId?: string;
    participants: string[];
    status: 'pending' | 'confirmed' | 'rejected' | 'ongoing' | 'completed' | 'cancelled';
    
    startDate: Timestamp;
    endDate: Timestamp;
    requiresDriver: boolean;
    pickupType: 'SELF_PICKUP' | 'OWNER_DELIVERY';

    baseRate: number;
    driverCharge: number;
    deliveryCharge: number;
    totalAmount: number;

    sahayakCommission?: number;
    platformFee?: number;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentId?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
