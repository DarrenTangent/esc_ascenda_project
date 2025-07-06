import React from 'react'
import HotelResultCard from './HotelResultCard';

type Props = {
    searchParams: any;
}

const Results: React.FC<Props> = async ({ searchParams }) => {
    const page = parseInt(searchParams.page) || 1;
    const maxCost = parseInt(searchParams.maxCost) || null;
    const minCost = parseInt(searchParams.minCost) || null;
    const pageSize = 30;

    const rawPricesData = await fetch("https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=RsBU&checkin=2025-07-11&checkout=2025-07-13&lang=en_US&currency=SGD&guests=2&partner_id=1", { cache: 'force-cache' });
    const jsonPricesData = await rawPricesData.json();
    let hotelPrices = jsonPricesData.hotels;
    
    
    if (minCost != null) hotelPrices = hotelPrices.filter((hotel: any) => minCost <= hotel.price);
    if (maxCost != null) hotelPrices = hotelPrices.filter((hotel: any) => hotel.price <= maxCost);
    console.log(hotelPrices);

    const totalPages = Math.ceil(hotelPrices.length / pageSize);
    const paginatedHotels = hotelPrices.slice((page - 1) * pageSize, page * pageSize);

    if (paginatedHotels.length == 0) return <div>No results found!</div>

    return (
        <div className='flex justify-center items-center flex-col my-4'>
            <form method='GET' action="/search" className='flex gap-2 mb-2'>
                <input name='minCost' type='number' min="0" max="99999" className='bg-white text-black' placeholder='Min Cost'/>
                <input name='maxCost' type='number' min="0" max="99999" className='bg-white text-black' placeholder='Max Cost'/>
                <button type='submit' className='rounded-3xl bg-white text-black px-5'>Filter</button>
            </form>
            <div className='grid grid-cols-3 lg:w-[60%]'>
                {paginatedHotels.map((hotel: any) => (<HotelResultCard price={hotel.price} roomsAvailable={hotel.rooms_available} marketRates={hotel.market_rates} id={hotel.id} searchRank={hotel.searchRank} key={hotel.id} />))}
            </div>
            <div className='flex gap-4 mt-4 justify-center items-center'>
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