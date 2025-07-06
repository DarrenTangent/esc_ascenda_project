import React from 'react'
import HotelResultCard from './HotelResultCard';

const Results = async () => {
    const rawData = await fetch("https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=RsBU&checkin=2025-07-11&checkout=2025-07-13&lang=en_US&currency=SGD&guests=2&partner_id=1", { signal: AbortSignal.timeout(10000) });
    const jsonData = await rawData.json();
    console.log(jsonData);

    return (
        <div className='flex justify-center items-center'>
            <div className='grid grid-cols-3 lg:w-[60%]'>{jsonData.hotels.map((hotel: any) => (<HotelResultCard price={hotel.price} roomsAvailable={hotel.rooms_available} marketRates={hotel.market_rates} id={hotel.id} searchRank={hotel.searchRank} key={hotel.id} />))}</div>
        </div>
    )
}

export default Results