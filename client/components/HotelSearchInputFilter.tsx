import React from 'react'

interface HotelSearchInputFilter {
  type: string;
  placeholder?: string;
  name: string;
}

const HotelSearchInputFilter: React.FC<HotelSearchInputFilter>  = ({ name, type, placeholder }) => {
    return (
        <input name={name} type={type} min="0" max="99999" className={`rounded-xl border-gray-500 border-2 mx-2`} placeholder={placeholder}/>
    )
}

export default HotelSearchInputFilter