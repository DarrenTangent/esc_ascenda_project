// app/page.tsx
'use client';
import Link from "next/link";
import DestinationSearch from '@/components/DestinationSearch';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Add Auth Navigation at the top */}
      <div className="absolute top-4 right-4 space-x-4">
        <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
          Login
        </Link>
        <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Sign Up
        </Link>
      </div>
      
      <main className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Travel Booking
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Find your next destination
          </p>
        </div>
        <div className="mt-10">
          <DestinationSearch />
        </div>
      </main>
    </div>
  );
}