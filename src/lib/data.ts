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
  },
];
