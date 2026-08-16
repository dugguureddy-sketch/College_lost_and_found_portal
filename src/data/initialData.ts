import { Item, User, PlatformStats, CategoryType, LocationType, CampusZone } from '../types';

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
  'Central Library',
  'Academic Block',
  'Canteen / Cafeteria',
  'Hostel',
  'Playground / Sports Complex',
  'Science & Tech Labs',
  'Auditorium',
  'Administrative Block',
  'Bus Stand / Parking',
  'Other Campus Area',
  'Custom Location',
];

export const CAMPUS_ZONES: CampusZone[] = [
  {
    name: 'Central Library',
    shortName: 'Library',
    x: 48,
    y: 28,
    hotspotLevel: 'High',
    description: '3-Story Library, Reading Hall & Digital Research Wing',
  },
  {
    name: 'Academic Block',
    shortName: 'Academic Blk',
    x: 24,
    y: 42,
    hotspotLevel: 'High',
    description: 'Lecture Halls 101-305, Seminar Rooms & Faculty Chambers',
  },
  {
    name: 'Canteen / Cafeteria',
    shortName: 'Cafeteria',
    x: 74,
    y: 45,
    hotspotLevel: 'High',
    description: 'Main Student Food Court, Coffee Lounge & Outdoor Deck',
  },
  {
    name: 'Science & Tech Labs',
    shortName: 'Tech Labs',
    x: 32,
    y: 68,
    hotspotLevel: 'Medium',
    description: 'Computing Labs, Robotics Center & Electronics Workshop',
  },
  {
    name: 'Hostel',
    shortName: 'Hostels',
    x: 82,
    y: 20,
    hotspotLevel: 'Medium',
    description: 'Student Residential Quarters & Common Rooms',
  },
  {
    name: 'Playground / Sports Complex',
    shortName: 'Sports Arena',
    x: 68,
    y: 75,
    hotspotLevel: 'Low',
    description: 'Football Ground, Basketball Court & Gymnasium',
  },
  {
    name: 'Auditorium',
    shortName: 'Auditorium',
    x: 52,
    y: 54,
    hotspotLevel: 'Low',
    description: 'Main Campus Event Center & Convocation Hall',
  },
  {
    name: 'Administrative Block',
    shortName: 'Admin & Security',
    x: 18,
    y: 18,
    hotspotLevel: 'Low',
    description: 'Dean Office, Security Headquarters & Lost Desk #1',
  },
  {
    name: 'Bus Stand / Parking',
    shortName: 'Parking & Gate',
    x: 12,
    y: 80,
    hotspotLevel: 'Medium',
    description: 'Main Transit Hub, Bicycle Bays & Security Gate 1',
  },
];

export const SAMPLE_USERS: User[] = [];

export const INITIAL_ITEMS: Item[] = [];

export const INITIAL_STATS: PlatformStats = {
  totalUsers: 0,
  totalLostItems: 0,
  totalFoundItems: 0,
  activeCasesCount: 0,
  recoveryRatePercent: 0,
  avgRecoveryHours: 0,
};

