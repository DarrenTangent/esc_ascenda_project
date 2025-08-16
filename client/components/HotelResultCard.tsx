// components/HotelResultCard.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SafeHotelImage from './SafeHotelImage';
import { Hotel } from '@/types/hotel';

export default function HotelResultCard({ hotel }: { hotel: Hotel }) {
  const params = useSearchParams();

  // Preserve search context
  const query = new URLSearchParams(params.toString());
  if (!query.get('rooms')) query.set('rooms', '1');
  if (!query.get('guests') && !query.get('adults')) query.set('guests', '2');

  const href = `/hotel/${encodeURIComponent(hotel.id)}?${query.toString()}`;

  const prefix =
    hotel?.imageDetails?.prefix ??
    'https://d2ey9sqrvkqdfs.cloudfront.net/'; // your CloudFront base

  return (
    <Link
      href={href}
      className="group grid grid-cols-[140px_1fr] gap-4 rounded-xl bg-white ring-1 ring-black/5 shadow hover:shadow-md transition overflow-hidden"
    >
      <div className="relative h-32 w-[140px]">
        <SafeHotelImage
          hotelId={hotel.id}
          imageUrl={hotel.imageUrl}
          fallbackPrefix={prefix}
          fallbackIndex={0}
          alt={hotel.name}
          fill
          quality={85}
          sizes="140px"
          priority={false}
        />
      </div>

      <div className="pr-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-900">
            {hotel.name}
          </h3>
          {hotel.price != null && (
            <div className="text-right">
              <div className="text-[13px] text-neutral-500">from</div>
              <div className="text-[15px] font-semibold text-neutral-900">
                ${hotel.price.toFixed(0)}
              </div>
            </div>
          )}
        </div>

        {hotel.address && (
          <p className="mt-1 text-sm text-neutral-600 line-clamp-1">{hotel.address}</p>
        )}

        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
          {hotel.rating ? <span>⭐ {hotel.rating}</span> : null}
          {hotel.freeCancellation ? (
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200">
              Free cancellation
            </span>
          ) : null}
        </div>

        <div className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-indigo-700 group-hover:underline">
          View details & book
        </div>
      </div>
    </Link>
  );
}
