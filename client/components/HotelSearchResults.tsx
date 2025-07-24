'use client';

import React, { useEffect, useState } from 'react';
import HotelResultCard from './HotelResultCard';
import { useSearchParams, useRouter } from 'next/navigation';

// TODO: HANDLE NO DATA FOR QUERY
const Results = () => {
    const [paginatedHotels, setPaginatedHotels] = useState<any>(null);
    const [page, setPage] = useState<number>();
    const [totalPages, setTotalPages] = useState<any>(null);

    const apiUrl = "http://localhost:5000/api/hotels/search"
    const baseUrl = "http://localhost:3000/search"

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const filters = ["minCost", "maxCost"];
        const newSearchParams = new URLSearchParams(searchParams);

        for (const filter of filters) {
            if (formData.has(filter)) {
                newSearchParams.set(filter, formData.get(filter)!.toString());
            }
        }

        console.log("NEW PARAMS", newSearchParams.toString());
        router.push(`${baseUrl}?${newSearchParams.toString()}`);
        getData(newSearchParams);
    }

    const handlePageSubmit = (event: any, operation: String) => {
        event.preventDefault();
        let newPage = page;
        if (page! > 1 && operation === "d") {
            newPage!--;
        }
        else if (page! < totalPages && operation === "i") {
            newPage!++;
        }
        setPage(newPage);
        
        console.log("PAGE", newPage);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", newPage!.toString());
        router.push(`${baseUrl}?${newSearchParams.toString()}`);
        getData(newSearchParams);
    }

    const getData = async (newSearchParams: URLSearchParams) => {
        try {
            const response = await fetch(`${apiUrl}?${newSearchParams.toString()}`);

            const data = await response.json();
            setPaginatedHotels(data.paginatedHotels);
            if (data.page > data.totalPages) {
                setPage(data.totalPages);
                newSearchParams.set("page", data.totalPages);
                router.push(`${baseUrl}?${newSearchParams.toString()}`);
                const newRes = await fetch(`${apiUrl}?${newSearchParams.toString()}`);
                const newData = await newRes.json();
                setPaginatedHotels(newData.paginatedHotels);
            }
            else {
                setPage(data.page);
            }
            setTotalPages(data.totalPages);
        } 
        catch (error) {
            console.error("Failed to fetch destinations:", error);
        }
    };

    useEffect(() => {
        console.log("ORIGINAL PARAMS", searchParams.toString());
        getData(new URLSearchParams(searchParams));
    }, []);

    if (!paginatedHotels && !page && !totalPages) return (<div>LOADING...</div>);

    return (
        <div className='flex justify-center items-center flex-col my-4'>
            <form onSubmit={handleFilterSubmit} className='flex gap-2 mb-2'>
                <input name='minCost' type='number' min="0" max="99999" className='bg-white text-black rounded-xl w-30 placeholder:px-2 h-7' placeholder='Min Cost'/>
                <input name='maxCost' type='number' min="0" max="99999" className='bg-white text-black rounded-xl w-30 placeholder:px-2 h-7' placeholder='Max Cost'/>
                <button type='submit' className='rounded-3xl bg-white text-black px-5'>Filter</button>
            </form>
            <div className='grid grid-cols-3 lg:w-[60%]'>
                {paginatedHotels.map((hotel: any) => (<HotelResultCard price={hotel.price} roomsAvailable={hotel.rooms_available} marketRates={hotel.market_rates} id={hotel.id} searchRank={hotel.searchRank} key={hotel.id} />))}
            </div>
            <div className='flex gap-4 mt-4 justify-center items-center'>
                {page! > 1 && (
                    <a onClick={e => handlePageSubmit(e, "d")} className="bg-white text-black px-3 py-1 rounded-xl">
                        ←
                    </a>
                )}
                <span className="">Page {page} of {totalPages}</span>
                {page! < totalPages && (
                    <a onClick={e => handlePageSubmit(e, "i")} className="bg-white text-black px-3 py-1 rounded-xl">
                        →
                    </a>
                )}
            </div>
        </div>
    )
}

export default Results