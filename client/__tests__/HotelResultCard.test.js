import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HotelResultCard from '../components/HotelResultCard';

const testData = {
  id: 'jzzR',
  searchRank: 0.96,
  free_cancellation: true,
  rooms_available: 18,
  price: 493.67,
  latitude: 1.311821,
  longitude: 103.87975,
  name: 'Hotel 81 Geylang',
  address: '20 Lorong 16 Geylang',
  rating: 2,
  amenities_ratings: [],
  description: '...',
  amenities: {},
  image_details: {},
  hires_image_index: '0,1,2'
};

describe('HotelResultCard', () => {
  it('renders hotel card', () => {
    render(<HotelResultCard hotel={testData} />);

    // Name present
    expect(screen.getByText(/Hotel 81 Geylang/i)).toBeInTheDocument();

    // Copy now shows "from" (not "per night")
    expect(screen.getByText(/from/i)).toBeInTheDocument();

    // Price is rounded in the UI (e.g. "$ 494")
    const rounded = Math.round(testData.price);
    const priceRegex = new RegExp(`\\$\\s*${rounded}\\b`);
    expect(screen.getByText(priceRegex)).toBeInTheDocument();

    // CTA present
    expect(screen.getByText(/View details/i)).toBeInTheDocument();
  });
});
