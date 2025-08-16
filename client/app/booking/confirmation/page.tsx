import { Suspense } from 'react';
import BookingConfirmation from '@/components/BookingConfirmation';

export default function BookingConfirmationPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      }
    >
      <BookingConfirmation />
    </Suspense>
  );
}
