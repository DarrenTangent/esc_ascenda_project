// components/HotelSearchInputFilter.tsx
import React from 'react';

interface HotelSearchInputFilter {
  name: string;
  type: string;
  placeholder?: string;
}

const HotelSearchInputFilter: React.FC<HotelSearchInputFilter> = ({
  name,
  type,
  placeholder,
}) => (
  <input
    name={name}
    type={type}
    min="0"
    placeholder={placeholder}
    className="px-2 py-1 border rounded-md"
  />
);

export default HotelSearchInputFilter;
