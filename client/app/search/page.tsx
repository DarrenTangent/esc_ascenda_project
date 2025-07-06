import React from 'react'
import HotelResultCard from './HotelResultCard';

type Props = {
    searchParams: any;
}

const Results: React.FC<Props> = async ({ searchParams }) => {
    const page = parseInt(searchParams.page) || 1;
    const pageSize = 30;

    const rawData = await fetch("https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=RsBU&checkin=2025-07-11&checkout=2025-07-13&lang=en_US&currency=SGD&guests=2&partner_id=1", { cache: 'force-cache' });
    const jsonData = await rawData.json();
    const hotels = jsonData.hotels;

    const totalPages = Math.ceil(hotels.length / pageSize);
    const paginatedHotels = hotels.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className='flex justify-center items-center flex-col'>
            <div className='grid grid-cols-3 lg:w-[60%]'>
                {paginatedHotels.map((hotel: any) => (<HotelResultCard price={hotel.price} roomsAvailable={hotel.rooms_available} marketRates={hotel.market_rates} id={hotel.id} searchRank={hotel.searchRank} key={hotel.id} />))}
            </div>
            <div className='flex gap-4 my-4 justify-center items-center'>
                {page > 1 && (
                    <a href={`/search?page=${page - 1}`} className="bg-white text-black px-3 py-1 rounded-xl">
                        ←
                    </a>
                )}
                <span className="">Page {page} of {totalPages}</span>
                {page < totalPages && (
                    <a href={`/search?page=${page + 1}`} className="bg-white text-black px-3 py-1 rounded-xl">
                        →
                    </a>
                )}
            </div>
        </div>
    )
}

export default Results