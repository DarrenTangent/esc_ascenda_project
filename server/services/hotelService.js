

// module.exports = new HotelService();
const NodeCache = require("node-cache");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { formatGuestsForAPI, buildImageUrl } = require('../utils/helpers');

const hotelsPath = path.join(__dirname, '..', 'data', 'fakedata.json');
const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf-8'));

class HotelService {
    constructor() {
        this.myCache = new NodeCache({ stdTTL: 600 }); // 10 minutes cache
        this.baseApiUrl = 'https://hotelapi.loyalty.dev/api';
        this.maxRetries = 10;
        this.retryDelay = 2000; // 2 seconds
        this.requireCompleted = true; // Flag to ensure API responses are completed before returning
    }

    async getHotels(req) {
        const pageSize = parseInt(req.query.pageSize) || 30;
        const page = parseInt(req.query.page) || 1;
        const maxCost = parseFloat(req.query.maxCost) || null;
        const minCost = parseFloat(req.query.minCost) || null;
        const destination = req.query.destination_id;
        const checkin = req.query.checkin;
        const checkout = req.query.checkout;
        const guests = req.query.guests || '2';
        const lang = req.query.lang || 'en_US';
        const currency = req.query.currency || 'SGD';
        const countryCode = req.query.country_code || 'SG';

        try {
            // Format guests properly for API
            const formattedGuests = formatGuestsForAPI(guests);
            
            // Get hotel prices and details concurrently
            const [hotelPrices, hotelDetails] = await Promise.all([
                this.getHotelPrices(destination, checkin, checkout, formattedGuests, lang, currency, countryCode),
                this.getHotelDetails(destination)
            ]);

            let hotelCombined = this.combineHotelData(hotelPrices, hotelDetails);

            // Apply price filtering
            if (minCost !== null) {
                hotelCombined = hotelCombined.filter(hotel => hotel.price >= minCost);
            }
            if (maxCost !== null) {
                hotelCombined = hotelCombined.filter(hotel => hotel.price <= maxCost);
            }

            // Sort by search rank (lower is better)
            hotelCombined.sort((a, b) => (a.searchRank || 999) - (b.searchRank || 999));

            // Apply pagination
            const totalHotels = hotelCombined.length;
            const totalPages = Math.ceil(totalHotels / pageSize);
            const startIndex = (page - 1) * pageSize;
            const paginatedHotels = hotelCombined.slice(startIndex, startIndex + pageSize);

            return {
                page: page,
                pageSize: pageSize,
                totalPages: totalPages,
                totalHotels: totalHotels,
                paginatedHotels: paginatedHotels
            };
        } catch (error) {
            console.error('Error in getHotels:', error);
            throw new Error(`Failed to fetch hotels: ${error.message}`);
        }
    }

    combineHotelData(hotelPrices, hotelDetails) {
        const hotelCombined = [];
        
        if (!hotelPrices || hotelPrices.length === 0) {
            return hotelCombined;
        }

        if (!hotelDetails || hotelDetails.length === 0) {
            return hotelCombined;
        }

        for (const priceData of hotelPrices) {
            const hotelDetail = hotelDetails.find(detail => detail.id === priceData.id);
            
            if (hotelDetail) {
                hotelCombined.push({
                    id: priceData.id,
                    searchRank: priceData.searchRank,
                    price: priceData.price,
                    marketRates: priceData.market_rates || [],
                    freeCancellation: priceData.free_cancellation || false,
                    roomsAvailable: priceData.rooms_available || 0,
                    
                    // Hotel static details
                    name: hotelDetail.name,
                    latitude: hotelDetail.latitude,
                    longitude: hotelDetail.longitude,
                    address: hotelDetail.address,
                    rating: hotelDetail.rating,
                    categories: hotelDetail.categories || [],
                    description: hotelDetail.description,
                    amenities: hotelDetail.amenities || [],
                    imageDetails: hotelDetail.image_details || {},
                    imageUrl: buildImageUrl(hotelDetail.image_details, 0), // Main image
                    
                    // Additional fields for compatibility
                    amenitiesRatings: hotelDetail.amenities_ratings || {},
                    hiresImageIndex: hotelDetail.hires_image_index || 0
                });
            }
        }
        
        return hotelCombined;
    }

    async getHotelPrices(destination, checkin, checkout, guests, lang = 'en_US', currency = 'SGD', countryCode = 'SG') {
        // Return mock data in test environment to avoid API calls
        if (process.env.NODE_ENV === 'test') {
            return this.getFallbackPricesData();
        }

        const cacheKey = `prices_${destination}_${checkin}_${checkout}_${guests}`;
        const cachedData = this.myCache.get(cacheKey);
        
        if (cachedData) {
            console.log('Using cached hotel prices data');
            return cachedData;
        }

        const params = {
            destination_id: destination,
            checkin: checkin,
            checkout: checkout,
            lang: lang,
            currency: currency,
            country_code: countryCode,
            guests: guests,
            partner_id: '1089',
            landing_page: 'wl-acme-earn',
            product_type: 'earn'
        };

        try {
            console.log('Fetching hotel prices from API...');
            const response = await this.pollForPrices(params);
            
            if (response && response.hotels) {
                this.myCache.set(cacheKey, response.hotels);
                return response.hotels;
            } else {
                console.warn('No hotels data in response, using fallback data');
                return this.getFallbackPricesData();
            }
        } catch (error) {
            console.error('Error fetching hotel prices, using fallback data:', error.message);
            return this.getFallbackPricesData();
        }
    }

    async pollForPrices(params) {
        const url = `${this.baseApiUrl}/hotels/prices`;
        
        console.log('Polling for prices with params:', params);
        console.log('Full URL:', `${url}?${new URLSearchParams(params).toString()}`);
        console.log('Require completed response:', this.requireCompleted);
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${this.maxRetries} to fetch prices...`);
                
                const response = await axios.get(url, { 
                    params,
                    timeout: 15000 // 15 second timeout
                });
                
                if (response.data && response.data.completed === true) {
                    console.log('Successfully fetched completed hotel prices data');
                    return response.data;
                } else if (response.data && response.data.hotels && !this.requireCompleted) {
                    // Only accept partial data if requireCompleted flag is disabled
                    console.log('Fetched partial hotel prices data (completed flag disabled)');
                    return response.data;
                } else if (response.data && response.data.completed === false) {
                    console.log(`Attempt ${attempt}: API response not yet completed, retrying...`);
                } else {
                    console.log(`Attempt ${attempt}: No valid data in response, retrying...`);
                }
                
                console.log(`Attempt ${attempt} incomplete, retrying in ${this.retryDelay}ms...`);
                await this.delay(this.retryDelay);
                
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.response?.status, error.message);
                
                if (attempt === this.maxRetries) {
                    throw error;
                }
                
                await this.delay(this.retryDelay);
            }
        }
        
        throw new Error('Max retries reached for hotel prices');
    }

    getFallbackPricesData() {
        // Return the hotels data from local JSON file as fallback
        if (hotels && hotels.hotels) {
            console.log('Using fallback hotel prices data');
            return hotels.hotels;
        }
        return [];
    }
    async getHotelDetails(destination) {
        // Return fake data in test environment to avoid API calls
        if (process.env.NODE_ENV === 'test') {
            return hotels.hotels; // Return the hotels array from the fake data object
        }

        const cacheKey = `details_${destination}`;
        const cachedData = this.myCache.get(cacheKey);
        
        if (cachedData) {
            console.log('Using cached hotel details data');
            return cachedData;
        }

        const url = `${this.baseApiUrl}/hotels`;
        const params = { destination_id: destination };

        try {
            console.log('Fetching hotel details from API...');
            const response = await axios.get(url, { 
                params,
                timeout: 10000 // 10 second timeout
            });
            
            if (response.data && Array.isArray(response.data)) {
                this.myCache.set(cacheKey, response.data);
                return response.data;
            } else {
                console.warn('Invalid hotel details response format');
                return [];
            }
        } catch (error) {
            console.error('Error fetching hotel details:', error.message);
            return [];
        }
    }

    async getHotelById(hotelId) {
        const cacheKey = `hotel_${hotelId}`;
        const cachedData = this.myCache.get(cacheKey);
        
        if (cachedData) {
            return cachedData;
        }

        const url = `${this.baseApiUrl}/hotels/${hotelId}`;

        try {
            const response = await axios.get(url, { timeout: 10000 });
            
            if (response.data) {
                this.myCache.set(cacheKey, response.data);
                return response.data;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching hotel ${hotelId}:`, error.message);
            return null;
        }
    }

    async getHotelPrice(hotelId, destination, checkin, checkout, guests, lang = 'en_US', currency = 'SGD', countryCode = 'SG') {
        const formattedGuests = formatGuestsForAPI(guests);
        const cacheKey = `price_${hotelId}_${destination}_${checkin}_${checkout}_${formattedGuests}`;
        const cachedData = this.myCache.get(cacheKey);
        
        if (cachedData) {
            console.log('Using cached price data for hotel:', hotelId);
            return cachedData;
        }

        const url = `${this.baseApiUrl}/hotels/${hotelId}/price`;
        const params = {
            destination_id: destination,
            checkin: checkin,
            checkout: checkout,
            lang: lang,
            currency: currency,
            country_code: countryCode,
            guests: formattedGuests,
            partner_id: '1089',
            landing_page: 'wl-acme-earn',
            product_type: 'earn'
        };

        // Retry logic for incomplete responses
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`>>> PRICE API CALL (Attempt ${attempt}/${this.maxRetries}) >>>)`);
                console.log('URL:', url);
                console.log('Params:', params);
                console.log('Cache key:', cacheKey);
                
                const response = await axios.get(url, { 
                    params,
                    timeout: 15000
                });
                
                console.log('API Response status:', response.status);
                console.log('API Response data keys:', response.data ? Object.keys(response.data) : 'NO DATA');
                console.log('Full API Response data:', JSON.stringify(response.data, null, 2));
                
                // Check if response is complete and has rooms
                if (response.data && response.data.completed === true && response.data.rooms && response.data.rooms.length > 0) {
                    console.log(`✅ Complete response received with ${response.data.rooms.length} rooms`);
                    this.myCache.set(cacheKey, response.data);
                    console.log('>>> PRICE API SUCCESS >>>');
                    return response.data;
                } else if (response.data && !this.requireCompleted) {
                    // Accept incomplete data if flag is disabled
                    console.log('⚠️ Accepting incomplete response (requireCompleted = false)');
                    this.myCache.set(cacheKey, response.data);
                    return response.data;
                } else if (response.data && response.data.completed === false) {
                    console.log(`⏳ Attempt ${attempt}: Price API response not yet completed, retrying...`);
                } else {
                    console.log(`⏳ Attempt ${attempt}: No valid price data in response, retrying...`);
                }

                // Don't retry on the last attempt
                if (attempt < this.maxRetries) {
                    console.log(`⏳ Attempt ${attempt} incomplete, retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay);
                }

            } catch (error) {
                console.error(`>>> PRICE API ERROR (Attempt ${attempt}) >>>`);
                console.error('URL that failed:', url);
                console.error('Error status:', error.response?.status);
                console.error('Error message:', error.message);
                console.error('Error response data:', error.response?.data);
                
                // Don't retry on the last attempt
                if (attempt < this.maxRetries) {
                    console.log(`💥 Error on attempt ${attempt}, retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay);
                } else {
                    console.error('>>> PRICE API FINAL ERROR >>>');
                    return null;
                }
            }
        }

        console.log(`❌ Max retries (${this.maxRetries}) exceeded for hotel price: ${hotelId}`);
        return null;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Method to control the requireCompleted flag
    setRequireCompleted(value) {
        this.requireCompleted = value;
        console.log(`Require completed response flag set to: ${value}`);
    }

    // Method to get current flag status
    getRequireCompleted() {
        return this.requireCompleted;
    }

}

module.exports = new HotelService();