import { render, screen, within } from '@testing-library/react';
import HotelResultCard from '../components/HotelResultCard';
import '@testing-library/jest-dom';

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
    amenities_ratings: [Array],
    description: 'Make use of convenient amenities, which include complimentary wireless internet access and gift shops/newsstands.\n' +
    '\n' +
    'Featured amenities include express check-out, a 24-hour front desk, and luggage storage. Limited parking is available onsite.\n' +
    '\n' +
    'Make yourself at home in one of the 85 guestrooms. Complimentary wireless internet access keeps you connected, and cable programming is available for your entertainment. Private bathrooms with showers feature complimentary toiletries and hair dryers. Conveniences include electric kettles and free tea bags/instant coffee, as well as phones with free local calls.\n' +
    '\n' +
    'Distances are displayed to the nearest 0.1 mile and kilometer. <br /> <p>Singapore National Stadium - 1.3 km / 0.8 mi <br /> Singapore Sports Hub - 1.4 km / 0.9 mi <br /> Singapore Indoor Stadium - 1.9 km / 1.2 mi <br /> East Coast Park - 2.4 km / 1.5 mi <br /> Bugis Street Shopping District - 2.5 km / 1.6 mi <br /> Sultan Mosque - 2.9 km / 1.8 mi <br /> Haji Lane - 3 km / 1.8 mi <br /> City Square Mall - 3 km / 1.9 mi <br /> Mustafa Centre - 3.2 km / 2 mi <br /> Bugis+ Shopping Center - 3.4 km / 2.1 mi <br /> Bugis Junction Shopping Center - 3.4 km / 2.1 mi <br /> Gardens By The Bay East - 3.5 km / 2.2 mi <br /> Suntec City - 3.6 km / 2.2 mi <br /> Suntec Convention & Exhibition Center - 3.6 km / 2.2 mi <br /> Suntec Singapore - 3.6 km / 2.3 mi <br /> </p><p>The nearest airports are:<br />Seletar Airport (XSP) - 14.7 km / 9.1 mi<br /> Singapore Changi Airport (SIN) - 18.1 km / 11.2 mi<br /> Senai International Airport (JHB) - 75.4 km / 46.8 mi<br /> </p><p>The preferred airport for Hotel 81 Geylang is Singapore Changi Airport (SIN). </p>\n' +
    '\n' +
    "With a stay at Hotel 81 Geylang in Singapore (Geylang), you'll be within a 5-minute drive of Bugis Street Shopping District and Singapore National Stadium.  This hotel is 3.3 mi (5.3 km) from Marina Bay Sands Casino and 3.5 mi (5.7 km) from Marina Bay Sands Skypark.\n" +
    '\n' +
    'In Singapore (Geylang)',
    amenities: {},
    image_details: [Object],
    hires_image_index: '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,19,20'
}

// describe('HodelResultCard', () => {
//     it('renders hotel card', () => {
//         render(<HotelResultCard hotel={testData}/>);
//         expect(screen.getByText('Hotel 81 Geylang')).toBeInTheDocument();
//         expect(screen.getByText('$493.67')).toBeInTheDocument();
//     })
// })

describe('HotelResultCard', () => {
  it('renders hotel card', () => {
    render(<HotelResultCard hotel={testData} />);
    expect(screen.getByText(/Hotel 81 Geylang/i)).toBeInTheDocument();

    // Find the row that has "per night" and then assert the price inside that row
    const priceRow = screen.getByText(/per night/i).closest('div');
    if (!priceRow) throw new Error('Price row not found');

    expect(within(priceRow).getByText(/\$\s*493\.67/)).toBeInTheDocument();
  });
});