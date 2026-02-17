import { PlaceHolderImages } from './placeholder-images';

export interface Equipment {
  id: string;
  name: string;
  type: 'Tractor' | 'Rotavator' | 'Plow' | 'Harvester' | 'Sprayer' | 'General Farm Equipment';
  owner: string; // This is for display, ownerId will be the UID
  ownerId: string;
  village: string;
  distance?: number; // in km - will be calculated dynamically
  travelTime?: number; // in minutes - will be calculated dynamically
  verified: boolean;
  price: {
    amount: number;
    unit: 'hour' | 'day' | 'acre';
  };
  latitude: number;
  longitude: number;
  geohash: string;
  availabilityStatus: 'available' | 'maintenance';
  imageUrl: string;
  imageHint: string;
}

const tractorImg = PlaceHolderImages.find(img => img.id === 'tractor_1')!;
const rotavatorImg = PlaceHolderImages.find(img => img.id === 'rotavator_1')!;
const plowImg = PlaceHolderImages.find(img => img.id === 'plow_1')!;
const harvesterImg = PlaceHolderImages.find(img => img.id === 'harvester_1')!;
const sprayerImg = PlaceHolderImages.find(img => img.id === 'sprayer_1')!;


export const equipmentData: Equipment[] = [
  {
    id: 'eq_1',
    name: 'Swaraj 744 FE',
    type: 'Tractor',
    owner: 'Suresh Patel',
    ownerId: 'owner_1_placeholder',
    village: 'Ramgarh',
    distance: 5,
    travelTime: 15,
    verified: true,
    price: { amount: 500, unit: 'hour' },
    imageUrl: tractorImg.imageUrl,
    imageHint: tractorImg.imageHint,
    latitude: 29.13,
    longitude: 75.78,
    geohash: 'ttn7z',
    availabilityStatus: 'available'
  },
  {
    id: 'eq_2',
    name: 'Shaktiman Rotavator',
    type: 'Rotavator',
    owner: 'Geeta Devi',
    ownerId: 'owner_2_placeholder',
    village: 'Sitapur',
    distance: 8,
    travelTime: 25,
    verified: false,
    price: { amount: 700, unit: 'hour' },
    imageUrl: rotavatorImg.imageUrl,
    imageHint: rotavatorImg.imageHint,
    latitude: 27.58,
    longitude: 80.68,
    geohash: 'tu6j8',
    availabilityStatus: 'available'
  },
  {
    id: 'eq_3',
    name: 'Mahindra Plough',
    type: 'Plow',
    owner: 'Vikram Singh',
    ownerId: 'owner_3_placeholder',
    village: 'Ramgarh',
    distance: 3,
    travelTime: 10,
    verified: true,
    price: { amount: 400, unit: 'acre' },
    imageUrl: plowImg.imageUrl,
    imageHint: plowImg.imageHint,
    latitude: 29.14,
    longitude: 75.76,
    geohash: 'ttn7z',
    availabilityStatus: 'available'
  },
  {
    id: 'eq_4',
    name: 'John Deere Harvester',
    type: 'Harvester',
    owner: 'Balwinder Singh',
    ownerId: 'owner_4_placeholder',
    village: 'Jodhpur',
    distance: 22,
    travelTime: 60,
    verified: true,
    price: { amount: 2000, unit: 'acre' },
    imageUrl: harvesterImg.imageUrl,
    imageHint: harvesterImg.imageHint,
    latitude: 26.23,
    longitude: 73.02,
    geohash: 'tthbq',
    availabilityStatus: 'available'
  },
  {
    id: 'eq_5',
    name: 'Farm Sprayer 200L',
    type: 'Sprayer',
    owner: 'Raniamma',
    ownerId: 'owner_5_placeholder',
    village: 'Kottayam',
    distance: 12,
    travelTime: 35,
    verified: false,
    price: { amount: 1500, unit: 'day' },
    imageUrl: sprayerImg.imageUrl,
    imageHint: sprayerImg.imageHint,
    latitude: 9.59,
    longitude: 76.52,
    geohash: 'tjsq9',
    availabilityStatus: 'available'
  },
];
