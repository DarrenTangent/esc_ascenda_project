'use client';

import React from 'react';

interface HotelResultCardProps {
    hotel: any;
}

const HotelResultCard: React.FC<HotelResultCardProps> = ({ hotel }) => {
    const stars = () => {
        return "⭐".repeat(Number(hotel.rating));
    }

    return (
        <div className='p-2 m-2 rounded-xl border-2 border-gray-200 bg-gray-100 hover:scale-110 transition-all cursor-pointer overflow-hidden'>
            <img src={`${hotel.image_details.prefix}0${hotel.image_details.suffix}`} className='w-full h-60 object-cover mb-2'/>
            <div className='flex justify-between'>
                <div>
                    <p className='text-lg font-bold'>{hotel.name.toString().length > 25 ? `${hotel.name.toString().substring(0, 25)}...` : hotel.name.toString()}</p>
                    <p className='text-sm '>{stars()}</p>
                </div>
                <div>
                    <p className='text-xl font-bold'>${hotel.price.toString()}</p>
                </div>
            </div>
        </div>
    )
}

export default HotelResultCard