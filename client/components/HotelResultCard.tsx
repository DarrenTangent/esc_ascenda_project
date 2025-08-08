// components/HotelResultCard.tsx
import React from 'react';

interface Hotel {
  id: string;
  name: string;
  price: number;
  rating: number;
  address: string;
  imageUrl?: string;
  imageDetails?: {
    prefix?: string;
    suffix?: string;
    count?: number;
  };
  amenities: string[];
  freeCancellation: boolean;
  searchRank: number;
  latitude: number;
  longitude: number;
}

interface HotelResultCardProps {
  hotel: Hotel;
}

const HotelResultCard: React.FC<HotelResultCardProps> = ({ hotel }) => {
  // Generate star rating display
  const stars = '⭐'.repeat(Math.min(Math.max(Math.floor(Number(hotel.rating || 0)), 0), 5));
  
  // Use the imageUrl if available, otherwise construct from imageDetails
  const imgUrl = hotel.imageUrl || 
    (hotel.imageDetails?.prefix && hotel.imageDetails?.suffix 
      ? `${hotel.imageDetails.prefix}0${hotel.imageDetails.suffix}`
      : '/placeholder-hotel.svg');

  // Format price
  const formattedPrice = typeof hotel.price === 'number' 
    ? hotel.price.toFixed(2) 
    : hotel.price;

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      {/* Hotel Image */}
      <div className="relative h-48 w-full">
        <img 
          src={imgUrl} 
          alt={hotel.name || 'Hotel'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-hotel.svg';
          }}
        />
        {hotel.freeCancellation && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            Free Cancellation
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
          ${formattedPrice}
        </div>
      </div>

      {/* Hotel Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 truncate mb-1">
          {hotel.name || 'Unknown Hotel'}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <span className="text-yellow-400 mr-1">{stars}</span>
          <span className="text-sm text-gray-600">
            {hotel.rating ? `${hotel.rating} stars` : 'No rating'}
          </span>
        </div>

        {/* Address */}
        {hotel.address && (
          <p className="text-sm text-gray-600 truncate mb-2">
            📍 {hotel.address}
          </p>
        )}

        {/* Amenities (first 3) */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-indigo-600">
            ${formattedPrice}
          </span>
          <span className="text-sm text-gray-500">per night</span>
        </div>
      </div>
    </div>
  );
};

export default HotelResultCard;
