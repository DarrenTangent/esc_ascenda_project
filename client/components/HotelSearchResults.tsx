'use client';

import React, { useEffect, useState } from 'react';
import HotelResultCard from './HotelResultCard';
import { useSearchParams, useRouter } from 'next/navigation';
import HotelSearchInputFilter from './HotelSearchInputFilter';

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
            // handle if old page value is more than new totalpages
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
            console.log(data.paginatedHotels);
            setTotalPages(data.totalPages);
        } 
        catch (error) {
            console.error("Failed to fetch destinations:", error);
        }
    };

    useEffect(() => {
        getData(new URLSearchParams(searchParams));
    }, []);

    if (!paginatedHotels && !page && !totalPages) return (<div>LOADING...</div>);

    return (
        <div className='overflow-x-hidden'>
            <div className='w-screen flex justify-center bg-gray-50 text-black'>
                <div className='my-4 w-[70%]'>
                    <form onSubmit={handleFilterSubmit} className='gap-2 mb-2'>
                        <HotelSearchInputFilter name='minCost' type='number' placeholder='Min Cost'/>
                        <HotelSearchInputFilter name='maxCost' type='number' placeholder='Max Cost'/>
                        <button type='submit' className='rounded-3xl text-black px-5 border-gray-500 border-2 hover:cursor-pointer hover:bg-gray-100 transition-all'>Filter</button>
                    </form>
                    <div className='flex justify items-center flex-col w-[100%]'>
                        <div className='grid grid-cols-3 w-[100%]'>
                            {paginatedHotels.map((hotel: any) => (<HotelResultCard price={hotel.price} roomsAvailable={hotel.rooms_available} id={hotel.id} searchRank={hotel.searchRank} key={hotel.id} />))}
                        </div>
                    </div>
                    <div className='flex gap-4 mt-4 justify-center items-center'>
                        {page! > 1 && (
                            <a onClick={e => handlePageSubmit(e, "d")} className="bg-white text-black px-3 py-1 rounded-xl cursor-pointer border-1 border-gray-500 hover:bg-gray-100 transition-all">
                                ←
                            </a>
                        )}
                        <span className="">Page {page} of {totalPages}</span>
                        {page! < totalPages && (
                            <a onClick={e => handlePageSubmit(e, "i")} className="bg-white text-black px-3 py-1 rounded-xl cursor-pointer border-1 border-gray-500 hover:bg-gray-100 transition-all">
                                →
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Results