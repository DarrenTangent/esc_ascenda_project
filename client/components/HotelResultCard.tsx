// components/HotelResultCard.tsx
import React from 'react';

interface HotelResultCardProps {
  hotel: any;
}

const HotelResultCard: React.FC<HotelResultCardProps> = ({ hotel }) => {
  const stars = '⭐'.repeat(Number(hotel.rating || 0));
  const imgUrl = `${hotel.image_details.prefix}0${hotel.image_details.suffix}`;

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
      <img src={imgUrl} alt={hotel.name} className="w-full h-48 object-cover" />
      <div className="p-2">
        <h3 className="font-semibold text-lg truncate">{hotel.name}</h3>
        <p className="text-sm">{stars}</p>
        <p className="mt-1 font-bold">${hotel.price}</p>
      </div>
    </div>
  );
};

export default HotelResultCard;
