const axios = require('axios');

// Mock hotel data - replace with actual API calls
const mockHotels = [
  {
    id: 'hotel_001',
    name: 'Marina Bay Sands',
    destination_id: 'SG',
    rating: 5,
    price: { amount: 450, currency: 'USD' },
    amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant'],
    image: 'https://example.com/marina-bay-sands.jpg',
    location: { lat: 1.2834, lng: 103.8607 }
  },
  {
    id: 'hotel_002',
    name: 'Raffles Hotel Singapore',
    destination_id: 'SG',
    rating: 5,
    price: { amount: 380, currency: 'USD' },
    amenities: ['Historical', 'Spa', 'WiFi', 'Restaurant'],
    image: 'https://example.com/raffles.jpg',
    location: { lat: 1.2945, lng: 103.8540 }
  },
  {
    id: 'hotel_003',
    name: 'The Plaza Hotel',
    destination_id: 'NYC',
    rating: 5,
    price: { amount: 520, currency: 'USD' },
    amenities: ['Luxury', 'Spa', 'WiFi', 'Restaurant'],
    image: 'https://example.com/plaza.jpg',
    location: { lat: 40.7648, lng: -73.9754 }
  },
  {
    id: 'hotel_004',
    name: 'The Ritz London',
    destination_id: 'LON',
    rating: 5,
    price: { amount: 480, currency: 'USD' },
    amenities: ['Luxury', 'Spa', 'WiFi', 'Restaurant'],
    image: 'https://example.com/ritz-london.jpg',
    location: { lat: 51.5074, lng: -0.1422 }
  }
];

class HotelService {
  constructor() {
    this.hotels = mockHotels;
  }

  async searchHotels(searchParams) {
    try {
      const { destination_id, checkin, checkout, guests, rooms, limit } = searchParams;
      
      // Filter hotels by destination
      let filteredHotels = this.hotels.filter(hotel => 
        hotel.destination_id === destination_id
      );

      // For now, we're using mock data
      // In a real implementation, you would make API calls to hotel booking services
      
      // Sort by rating and price (you can modify this logic)
      filteredHotels = filteredHotels.sort((a, b) => {
        if (a.rating !== b.rating) {
          return b.rating - a.rating; // Higher rating first
        }
        return a.price.amount - b.price.amount; // Lower price first
      });

      // Apply limit
      filteredHotels = filteredHotels.slice(0, limit);

      // Add search metadata
      return filteredHotels.map(hotel => ({
        ...hotel,
        searchParams: {
          checkin,
          checkout,
          guests,
          rooms
        },
        availability: this.checkAvailability(hotel, checkin, checkout)
      }));

    } catch (error) {
      console.error('Error searching hotels:', error);
      throw new Error('Failed to search hotels');
    }
  }

  async getHotelById(id) {
    try {
      return this.hotels.find(hotel => hotel.id === id) || null;
    } catch (error) {
      console.error('Error getting hotel by ID:', error);
      throw new Error('Failed to get hotel');
    }
  }

  checkAvailability(hotel, checkin, checkout) {
    // Mock availability check
    // In real implementation, this would check actual availability
    return {
      available: true,
      roomsLeft: Math.floor(Math.random() * 5) + 1,
      lastUpdated: new Date().toISOString()
    };
  }

  // Method to integrate with external hotel APIs
  async fetchFromExternalAPI(searchParams) {
    try {
      // Example API integration - replace with actual API calls to Ascenda or other providers
      // const response = await axios.get(`${process.env.HOTEL_API_URL}/search`, {
      //   params: searchParams,
      //   headers: { 'Authorization': `Bearer ${process.env.HOTEL_API_KEY}` }
      // });
      // return response.data;
      
      // For now, return empty array as we're using mock data
      return [];
    } catch (error) {
      console.error('External hotel API error:', error);
      return [];
    }
  }

  // Method to format guest and room parameters for external APIs
  formatGuestRoomParams(guests, rooms) {
    // Format according to your API requirements
    // Example format for common hotel APIs:
    return {
      adults: guests,
      rooms: rooms,
      // children: 0, // Add children parameter if needed
    };
  }
}

module.exports = new HotelService();
