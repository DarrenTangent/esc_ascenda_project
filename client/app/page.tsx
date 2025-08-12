// app/page.tsx
'use client';

import HeroWithSearch from '@/components/HeroWithSearch';
import FeaturedDestinations from '@/components/FeaturedDestinations';
import DealsOfTheWeek from '@/components/DealsOfTheWeek';
import WhyBookWithUs from '@/components/WhyBookWithUs';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroWithSearch />
      <FeaturedDestinations />
      <DealsOfTheWeek />
      <WhyBookWithUs />
    </main>
  );
}
