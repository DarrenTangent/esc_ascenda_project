'use client'

import React, { useState } from "react";

const HotelDetails = () => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const images = [
    "https://i.pinimg.com/736x/77/0f/8d/770f8deb94ce00c789bab487c189f476.jpg",
    "https://static1.srcdn.com/wordpress/wp-content/uploads/2019/09/SpongeBob-SquarePants-And-Nuclear-Bomb.jpg",
    "https://easydrawingguides.com/wp-content/uploads/2017/03/how-to-draw-a-fish-featured-image-1200.png",
    "https://www.kikkoman.eu/fileadmin/_processed_/4/2/csm_sushi-kakkoii_2c56fe3133.webp",
    "https://i.pinimg.com/564x/9a/21/53/9a2153e4ad1c3.jpg",
    "https://i.pinimg.com/564x/7c/fd/3c/7cfd3c86f823.jpg"
  ];

  const rooms = [
    { id: 1, type: "Standard Room", price: "$120/night", guests: "2 guests" },
    { id: 2, type: "Deluxe Suite", price: "$200/night", guests: "3 guests" },
    { id: 3, type: "Ocean View Suite", price: "$350/night", guests: "4 guests" },
  ];

  const visibleImages = showAllPhotos ? images : images.slice(0, 3);

  return (
    <div className="bg-slate-50 text-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="mb-10">
          <h1
            className="text-5xl font-bold tracking-tight text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Bikini Bottoms Hotel
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-yellow-500 text-xl font-semibold">★ 4.5</span>
            <span
              className="text-slate-600 text-lg"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Grandfather's Rd, 137 Longkang Dr
            </span>
          </div>
        </header>

        {/* Images Section */}
        <div className="mb-20">
        {!showAllPhotos ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[480px]">
            {/* Main large photo (3/5 width) */}
            <div className="lg:col-span-3 relative overflow-hidden">
                <img
                src={images[0]}
                alt="Main Hotel"
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                />
            </div>

            {/* 4 smaller photos on the side (2/5 width) */}
            <div className="lg:col-span-2 grid grid-cols-2 grid-rows-2 gap-4">
                {images.slice(1, 5).map((src, index) => (
                <div key={index} className="relative overflow-hidden">
                    <img
                    src={src}
                    alt={`Hotel photo ${index + 2}`}
                    className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                    />
                </div>
                ))}
            </div>
            </div>
        ) : (
            // Expanded view: full grid
            <div
            className={`grid gap-4 transition-all duration-500 ease-in-out grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
            >
            {images.map((src, index) => (
                <div key={index} className="bg-white shadow relative overflow-hidden">
                <img
                    src={src}
                    alt={`Hotel photo ${index + 1}`}
                    className="w-full h-64 object-cover transform transition-transform duration-500 hover:scale-105"
                />
                </div>
            ))}
            </div>
        )}

        <div className="mt-8 flex justify-center">
            <button
            onClick={() => setShowAllPhotos(!showAllPhotos)}
            className="px-6 py-3 bg-slate-900 text-white font-semibold hover:bg-slate-700 transition rounded"
            style={{ fontFamily: '"Poppins", sans-serif' }}
            >
            {showAllPhotos ? "Show Less Photos" : "Show More Photos"}
            </button>
        </div>
        </div>


        {/* Description */}
        <section className="mb-14">
          <h2
            className="text-3xl font-semibold mb-5 text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            About this hotel
          </h2>
          <p
            className="text-lg leading-relaxed text-gray-700"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Welcome to Bikini Bottoms Hotel, a modern ocean-inspired stay with
            stunning interiors and cozy rooms. Experience beach vibes, fine
            dining, and world-class hospitality designed for relaxation.
          </p>
        </section>

        {/* Amenities */}
        <section className="mb-16">
          <h2
            className="text-3xl font-semibold mb-5 text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Amenities
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {[
              "Free Wi-Fi",
              "Outdoor Pool",
              "Spa & Sauna",
              "Concierge Service",
              "Private Parking",
              "Fitness Center",
            ].map((item, index) => (
              <li
                key={index}
                className="bg-white border border-slate-100 rounded-lg p-4 text-slate-700 hover:shadow-md transition"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Available Rooms */}
        <section className="mb-16">
          <h2
            className="text-3xl font-semibold mb-6 text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Available Rooms
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <h3
                  className="text-xl font-bold mb-1 text-slate-900"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  {room.type}
                </h3>
                <p
                  className="text-slate-500"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {room.guests}
                </p>
                <p
                  className="mt-3 font-semibold text-sky-700"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {room.price}
                </p>
                <button
                  onClick={() =>
                    alert(`Redirect to booking for ${room.type}`)
                  }
                  className="mt-5 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-semibold py-2 rounded-lg hover:opacity-90 transition"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Select Room
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Map */}
        <section>
          <h2
            className="text-3xl font-semibold mb-5 text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Location
          </h2>
          <div className="w-full h-80 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shadow-inner">
            <p
              className="text-slate-500"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Map Placeholder (Lat/Lon)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HotelDetails;
