// lib/blogData.ts
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;        // ISO
  author: string;
  cover?: string;      // /blog/*.jpg (place in public/blog)
  content: string;     // simple markdown-ish
  tags?: string[];
};

export const posts: BlogPost[] = [
  {
    slug: 'singapore-long-weekend-guide',
    title: 'A 48-Hour Guide to Singapore',
    excerpt:
      'Max out a weekend: hawker food, skyline views, and hidden green spots—without rushing.',
    date: '2025-08-10',
    author: 'Ascenda Editorial',
    cover: '/blog/sg-weekend.jpg',
    tags: ['Guide', 'Singapore', 'Food'],
    content: `
## Why go now
Singapore packs world-class eats and design into a tiny footprint.

## Day 1: Core classics
• Breakfast at a hawker centre  
• National Gallery (cool off, great views)  
• Gardens by the Bay at sunset

## Day 2: Neighborhoods
• Joo Chiat shophouses  
• Tiong Bahru cafes  
• Evening drinks by the river

> Tip: Try weekday stays—rates dip and queues shrink.
`,
  },
  {
    slug: 'bali-for-first-timers',
    title: 'Bali for First-Timers: Calm > Chaos',
    excerpt:
      'Pick one coast, slow down, and leave time for the rice terraces. Here’s how to keep it easy.',
    date: '2025-08-05',
    author: 'Ascenda Editorial',
    cover: '/blog/bali-first.jpg',
    tags: ['Bali', 'Beaches', 'Relax'],
    content: `
## Keep it simple
Choose Uluwatu *or* Ubud for a first visit—don’t try to do both in 3 days.

### Where to stay
Smaller stays within walking distance of cafes and beaches feel breezier.

• Uluwatu: cliff views, sunsets  
• Ubud: rice terraces, wellness

> Tip: Arrange airport pickup via your hotel—less hassle after a long flight.
`,
  },
];
