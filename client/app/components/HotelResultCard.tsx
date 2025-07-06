import React from 'react'

interface HotelResultCardProps {
    price: Number;
    roomsAvailable: Number;
    marketRates: Array<any>;
    id: Number;
    searchRank: Number;
}

const HotelResultCard: React.FC<HotelResultCardProps> = ({ price, roomsAvailable, marketRates, id, searchRank }) => {
    return (
        <div className='p-2 m-2 rounded-xl bg-amber-800'>
            <p>Hotel ID: {id.toString()}</p>
            <p className='text-xl font-bold'>${price.toString()}</p>
            <p>Rooms available: {roomsAvailable.toString()}</p>
            <div>{marketRates.map((rate: any) => (
                <p>Market Rate: {parseFloat(rate.rate).toFixed(1)} {rate.supplier}</p>
            ))}</div>
            <p>Search Rank: {searchRank.toString()}</p>
        </div>
    )
}

export default HotelResultCard