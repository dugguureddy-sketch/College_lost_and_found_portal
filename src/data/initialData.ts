import { Item, User, PlatformStats, CategoryType, LocationType } from '../types';

export const CATEGORIES: { name: CategoryType; iconName: string; description: string }[] = [
  { name: 'Electronics', iconName: 'Laptop', description: 'Calculators, Earbuds, Laptops, Phones, Chargers' },
  { name: 'ID Cards', iconName: 'IdCard', description: 'College ID, Govt ID, Driving License, Library Cards' },
  { name: 'Books', iconName: 'BookOpen', description: 'Textbooks, Notebooks, Reference Material, Lab Manuals' },
  { name: 'Wallet', iconName: 'Wallet', description: 'Wallets, Purses, Cardholders, Cash Pouches' },
  { name: 'Keys', iconName: 'Key', description: 'Hostel Keys, Bike Keys, Room Keychains' },
  { name: 'Bags', iconName: 'ShoppingBag', description: 'Backpacks, Handbags, Laptop Bags, Gym Bags' },
  { name: 'Accessories', iconName: 'Watch', description: 'Watches, Glasses, Umbrellas, Water Bottles' },
  { name: 'Clothing', iconName: 'Shirt', description: 'Jackets, Sweaters, Caps, Sports Jerseys' },
  { name: 'Documents', iconName: 'FileText', description: 'Certificates, Hall Tickets, Project Reports' },
  { name: 'Other', iconName: 'Box', description: 'Miscellaneous campus items' },
];

export const CAMPUS_LOCATIONS: LocationType[] = [
  'Custom Location',
  'Academic Block',
  'Central Library',
  'Canteen / Cafeteria',
  'Hostel',
  'Playground / Sports Complex',
  'Science & Tech Labs',
  'Auditorium',
  'Administrative Block',
  'Bus Stand / Parking',
  'Other Campus Area',
];

export const SAMPLE_USERS: User[] = [
  {
    id: 'user-101',
    regNumber: '250301120030',
    name: 'Amrit Rout',
    email: 'amrit.rout@campus.edu',
    branch: 'CSE',
    year: '2nd Year',
    phone: '+91 98765 43210',
    role: 'admin',
    createdAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'user-102',
    regNumber: '250301120010',
    name: 'Atirajam Giridhar',
    email: 'atirajam.giridhar@campus.edu',
    branch: 'CSE',
    year: '2nd Year',
    phone: '+91 91234 56789',
    role: 'admin',
    createdAt: '2026-07-21T11:30:00Z',
  },
  {
    id: 'user-103',
    regNumber: '250301120059',
    name: 'Arindam Mohanty',
    email: 'arindam.mohanty@campus.edu',
    branch: 'CSE',
    year: '2nd Year',
    phone: '+91 99887 76655',
    role: 'admin',
    createdAt: '2026-07-22T09:15:00Z',
  },
];

export const INITIAL_ITEMS: Item[] = [];

export const INITIAL_STATS: PlatformStats = {
  totalUsers: 0,
  totalLostItems: 0,
  totalFoundItems: 0,
  activeCasesCount: 0,
};
