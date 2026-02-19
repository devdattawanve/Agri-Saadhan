import type { Timestamp } from 'firebase/firestore';

export interface Equipment {
  id: string;
  name: string;
  type: 'Tractor' | 'Rotavator' | 'Plow' | 'Harvester' | 'Sprayer' | 'General Farm Equipment';
  description: string;
  ownerId: string;
  village: string;
  verified: boolean;
  pricePerHour?: number;
  pricePerDay?: number;
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
    farmerId: string; 
    createdBy: string;
    participants: string[];
    
    bookingType: 'hourly' | 'daily';
    startDate: Timestamp;
    endDate: Timestamp;
    duration: number; // in hours or days depending on bookingType
    totalPrice: number;

    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    statusChangeAcknowledged?: boolean;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}
