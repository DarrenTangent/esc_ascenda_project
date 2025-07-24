'use client';

import React from 'react';

interface HotelResultCardProps {
    price: Number;
    roomsAvailable: Number;
    marketRates: Array<any>;
    id: Number;
    searchRank: Number;
}

const HotelResultCard: React.FC<HotelResultCardProps> = ({ price, roomsAvailable, marketRates, id, searchRank }) => {
    return (
        <div className='p-2 m-2 rounded-xl border-2 border-gray-200 bg-gray-100 hover:scale-110 transition-all cursor-pointer'>
            <div className='flex justify-between'>
                <div>
                    <p className='text-lg'>Hotel ID: {id.toString()}</p>
                    <p className='text-sm'>{roomsAvailable.toString()} rooms available</p>
                    <p className='text-sm'>Search Rank: {searchRank.toString()}</p>
                </div>
                <div>
                    <p className='text-2xl font-bold'>${price.toString()}</p>
                    <div>{marketRates.map((rate: any) => (
                        <p className='text-sm'>${parseFloat(rate.rate).toFixed(1)} market rate</p>
                    ))}</div>
                </div>
            </div>
        </div>
    )
}

export default HotelResultCard