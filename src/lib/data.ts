import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder | undefined => PlaceHolderImages.find(img => img.id === id);

export interface Equipment {
  id: string;
  name: string;
  type: 'Tractor' | 'Rotavator' | 'Plow' | 'Harvester' | 'Sprayer' | 'General Farm Equipment';
  owner: string;
  village: string;
  distance: number; // in km
  travelTime: number; // in minutes
  verified: boolean;
  price: {
    amount: number;
    unit: 'hour' | 'day' | 'acre';
  };
  image: ImagePlaceholder;
  latitude: number;
  longitude: number;
  geohash: string;
  availabilityStatus: 'available' | 'maintenance';
}

export const equipmentData: Equipment[] = [
  {
    id: 'eq_1',
    name: 'Swaraj 744 FE',
    type: 'Tractor',
    owner: 'Suresh Patel',
    village: 'Ramgarh',
    distance: 5,
    travelTime: 15,
    verified: true,
    price: { amount: 500, unit: 'hour' },
    image: getImage('tractor_1')!,
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
    village: 'Sitapur',
    distance: 8,
    travelTime: 25,
    verified: false,
    price: { amount: 700, unit: 'hour' },
    image: getImage('rotavator_1')!,
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
    village: 'Ramgarh',
    distance: 3,
    travelTime: 10,
    verified: true,
    price: { amount: 400, unit: 'acre' },
    image: getImage('plow_1')!,
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
    village: 'Jodhpur',
    distance: 22,
    travelTime: 60,
    verified: true,
    price: { amount: 2000, unit: 'acre' },
    image: getImage('harvester_1')!,
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
    village: 'Kottayam',
    distance: 12,
    travelTime: 35,
    verified: false,
    price: { amount: 1500, unit: 'day' },
    image: getImage('sprayer_1')!,
    latitude: 9.59,
    longitude: 76.52,
    geohash: 'tjsq9',
    availabilityStatus: 'available'
  },
];
