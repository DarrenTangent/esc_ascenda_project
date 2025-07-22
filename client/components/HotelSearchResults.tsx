'use client';

import React, { useEffect, useState } from 'react';
import HotelResultCard from './HotelResultCard';
import { useSearchParams } from 'next/navigation';

// TODO: HANDLE NO DATA FOR QUERY
// TODO: handle pagination and filters properly cause now they override each other
const Results = () => {
    const [paginatedHotels, setPaginatedHotels] = useState<any>(null);
    const [page, setPage] = useState<any>(null);
    const [totalPages, setTotalPages] = useState<any>(null);

    const baseUrl = "http://localhost:5000/api/hotels/search"

    const searchParams = useSearchParams();

    const search = async () => {
        try {
            console.log(searchParams.toString());
            const response = await fetch(`${baseUrl}?${searchParams.toString()}`);

            const data = await response.json();
            console.log(data);
            setPaginatedHotels(data.paginatedHotels);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } 
        catch (error) {
            console.error("Failed to fetch destinations:", error);
        }
    };

    useEffect(() => {
        search();
    }, [])

    if (!paginatedHotels && !page && !totalPages) return (<div>LOADING...</div>);

    return (
        <div className='flex justify-center items-center flex-col my-4'>
            <form method='GET' action={`/search`} className='flex gap-2 mb-2'>
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