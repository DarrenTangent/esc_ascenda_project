// lib/destinations.ts
export type DestHotel = {
  id: string;
  name: string;
  priceFrom: number;
  image: string; // public image
  blurb: string;
};

export type Destination = {
  slug: string;
  name: string;
  hero: string;  // public hero image
  tagline: string;
  description: string;
  hotels: DestHotel[];
};

export const DESTS: Record<string, Destination> = {
  singapore: {
    slug: 'singapore',
    name: 'Singapore',
    hero: '/featured/singapore.jpg',
    tagline: 'City meets nature',
    description:
      'Skyline views, hawker gems, clean green living. A vibrant hub where modern architecture meets tropical parks.',
    hotels: [
      {
        id: 'sg-1',
        name: 'Marina Bay View',
        priceFrom: 180,
        image: '/deals/sg-1.jpg',
        blurb: 'Infinity pool vibes & landmark views.',
      },
      {
        id: 'sg-2',
        name: 'Orchard Hideout',
        priceFrom: 155,
        image: '/deals/sg-2.jpg',
        blurb: 'Shopping at your doorstep.',
      },
    ],
  },
  tokyo: {
    slug: 'tokyo',
    name: 'Tokyo',
    hero: '/featured/tokyo.jpg',
    tagline: 'Neon & noodles',
    description:
      'Classic temples, future tech, and late-night ramen. Explore neighborhoods with their own personalities.',
    hotels: [
      { id: 'tyo-1', name: 'Shinjuku Lights', priceFrom: 220, image: '/deals/tokyo-1.jpg', blurb: 'Steps from the JR loop.' },
      { id: 'tyo-2', name: 'Asakusa Calm',  priceFrom: 190, image: '/deals/tokyo-2.jpg', blurb: 'Traditional streets, modern stay.' },
    ],
  },
  bali: {
    slug: 'bali',
    name: 'Bali',
    hero: '/featured/bali.jpg',
    tagline: 'Island bliss',
    description:
      'Surf, rice terraces, sunset swings, and cafes. A tropical paradise with wellness at its heart.',
    hotels: [
      { id: 'bali-1', name: 'Ubud Jungle Villas', priceFrom: 120, image: '/deals/bali-1.jpg', blurb: 'Nestled among the trees.' },
      { id: 'bali-2', name: 'Canggu Surf House',  priceFrom: 135, image: '/deals/bali-2.jpg', blurb: 'Beach clubs & breaks.' },
    ],
  },
  paris: {
    slug: 'paris',
    name: 'Paris',
    hero: '/featured/paris.jpg',
    tagline: 'Art & romance',
    description:
      'Cafés, museums, river strolls. Classic boulevards and cozy corners in the City of Light.',
    hotels: [
      { id: 'par-1', name: 'Left Bank Boutique', priceFrom: 210, image: '/deals/paris-1.jpg', blurb: 'Walk to the Seine.' },
      { id: 'par-2', name: 'Montmartre View',    priceFrom: 195, image: '/deals/paris-2.jpg', blurb: 'Artists & rooftops.' },
    ],
  },
  bangkok: {
    slug: 'bangkok',
    name: 'Bangkok',
    hero: '/featured/bangkok.jpg',
    tagline: 'Street food capital',
    description:
      'Night markets, river ferries, and sky bars. A city that never slows down.',
    hotels: [
      { id: 'bkk-1', name: 'Sukhumvit Sky', priceFrom: 95, image: '/deals/bkk-1.jpg', blurb: 'Lively & connected.' },
      { id: 'bkk-2', name: 'Riverside Calm', priceFrom: 120, image: '/deals/bkk-2.jpg', blurb: 'Boats & sunsets.' },
    ],
  },
  seoul: {
    slug: 'seoul',
    name: 'Seoul',
    hero: '/featured/seoul.jpg',
    tagline: 'Trends & temples',
    description:
      'Palaces, K-fashion, street eats. Tradition and tech woven together.',
    hotels: [
      { id: 'sel-1', name: 'Myeongdong Hub', priceFrom: 170, image: '/deals/seoul-1.jpg', blurb: 'Shop & snack all day.' },
      { id: 'sel-2', name: 'Bukchon Stay',    priceFrom: 185, image: '/deals/seoul-2.jpg', blurb: 'Hanok lanes nearby.' },
    ],
  },
};
