/**
 * Ascenda API Integration Test
 * This script tests all the Ascenda API endpoints and functionality
 * Using real destinations from destinations.json
 */

const axios = require('axios');

const BASE_URL = 'https://hotelapi.loyalty.dev/api';
const SERVER_URL = 'http://localhost:5001/api';

// Test destinations from destinations.json
const testDestinations = [
    {
        name: 'Singapore',
        id: 'RsBU',
        term: 'Singapore, Singapore',
        searchQuery: 'singapore'
    },
    {
        name: 'Tokyo',
        id: 'fRZM', 
        term: 'Tokyo, Japan',
        searchQuery: 'tokyo'
    },
    {
        name: 'New York',
        id: 'jiHz',
        term: 'New York, NY, United States', 
        searchQuery: 'new york'
    }
];

// Default test destination (Singapore)
const primaryDestination = testDestinations[0];

// Test parameters using primary destination
const testParams = {
    destination_id: primaryDestination.id,
    checkin: '2025-08-15',
    checkout: '2025-08-20',
    lang: 'en_US',
    currency: 'SGD',
    country_code: 'SG',
    guests: '2',
    partner_id: '1089',
    landing_page: 'wl-acme-earn',
    product_type: 'earn'
};

/**
 * Test direct Ascenda API endpoints
 */
async function testDirectAscendaAPI() {
    console.log('\n🔍 Testing Direct Ascenda API Endpoints...\n');
    console.log(`Using destination: ${primaryDestination.name} (${primaryDestination.id})`);

    try {
        // 1. Test hotel prices endpoint
        console.log('\n1. Testing /api/hotels/prices...');
        const pricesResponse = await axios.get(`${BASE_URL}/hotels/prices`, {
            params: testParams,
            timeout: 20000
        });
        console.log('✅ Prices API Response Status:', pricesResponse.status);
        console.log('   Completed:', pricesResponse.data.completed);
        console.log('   Hotels found:', pricesResponse.data.hotels?.length || 0);
        
        if (pricesResponse.data.hotels?.length > 0) {
            const firstHotel = pricesResponse.data.hotels[0];
            console.log('   First hotel:', firstHotel.id, '- Price:', firstHotel.price);
            
            // 2. Test hotel details endpoint
            console.log('\n2. Testing /api/hotels (static details)...');
            const detailsResponse = await axios.get(`${BASE_URL}/hotels`, {
                params: { destination_id: testParams.destination_id },
                timeout: 10000
            });
            console.log('✅ Hotel details API Response Status:', detailsResponse.status);
            console.log('   Hotels details found:', detailsResponse.data.length || 0);

            // 3. Test specific hotel endpoint
            console.log('\n3. Testing /api/hotels/:id...');
            const hotelResponse = await axios.get(`${BASE_URL}/hotels/${firstHotel.id}`, {
                timeout: 10000
            });
            console.log('✅ Specific hotel API Response Status:', hotelResponse.status);
            console.log('   Hotel name:', hotelResponse.data.name);

            // 4. Test specific hotel price endpoint
            console.log('\n4. Testing /api/hotels/:id/price...');
            const hotelPriceResponse = await axios.get(`${BASE_URL}/hotels/${firstHotel.id}/price`, {
                params: testParams,
                timeout: 15000
            });
            console.log('✅ Hotel price API Response Status:', hotelPriceResponse.status);
            console.log('   Rooms available:', hotelPriceResponse.data.rooms?.length || 0);
        } else {
            console.log('⚠️  No hotels found for this destination, skipping hotel-specific tests');
        }

    } catch (error) {
        console.error('❌ Direct API Error:', error.response?.status, error.message);
        console.error('   Error details:', error.response?.data);
    }
}

/**
 * Test our server API endpoints
 */
async function testServerAPI() {
    console.log('\n🚀 Testing Our Server API Endpoints...\n');

    try {
        // 1. Test hotel search endpoint
        console.log('1. Testing /api/hotels/search...');
        const searchResponse = await axios.get(`${SERVER_URL}/hotels/search`, {
            params: {
                destination_id: testParams.destination_id,
                checkin: testParams.checkin,
                checkout: testParams.checkout,
                guests: testParams.guests,
                page: 1,
                pageSize: 10
            },
            timeout: 30000
        });
        console.log('✅ Hotel search Response Status:', searchResponse.status);
        console.log('   Page:', searchResponse.data.page);
        console.log('   Total hotels:', searchResponse.data.totalHotels);
        console.log('   Hotels on this page:', searchResponse.data.paginatedHotels?.length || 0);
        
        if (searchResponse.data.paginatedHotels?.length > 0) {
            const firstHotel = searchResponse.data.paginatedHotels[0];
            console.log('   First hotel:', firstHotel.name, '- Price:', firstHotel.price);

            // 2. Test specific hotel details
            console.log('\n2. Testing /api/hotels/:id...');
            const hotelDetailsResponse = await axios.get(`${SERVER_URL}/hotels/${firstHotel.id}`, {
                timeout: 10000
            });
            console.log('✅ Hotel details Response Status:', hotelDetailsResponse.status);
            console.log('   Hotel name:', hotelDetailsResponse.data.name);

            // 3. Test specific hotel price
            console.log('\n3. Testing /api/hotels/:id/price...');
            const hotelPriceResponse = await axios.get(`${SERVER_URL}/hotels/${firstHotel.id}/price`, {
                params: {
                    destination_id: testParams.destination_id,
                    checkin: testParams.checkin,
                    checkout: testParams.checkout,
                    guests: testParams.guests
                },
                timeout: 20000
            });
            console.log('✅ Hotel price Response Status:', hotelPriceResponse.status);
            console.log('   Rooms available:', hotelPriceResponse.data.rooms?.length || 0);
        }

        // 4. Test destinations search with multiple queries
        console.log('\n4. Testing /api/destinations/search...');
        for (const destination of testDestinations) {
            try {
                const destinationsResponse = await axios.get(`${SERVER_URL}/destinations/search`, {
                    params: { q: destination.searchQuery },
                    timeout: 5000
                });
                console.log(`✅ Search for "${destination.searchQuery}": ${destinationsResponse.data.destinations?.length || 0} found`);
                
                // Check if our expected destination ID is in the results
                const foundDestination = destinationsResponse.data.destinations?.find(d => d.uid === destination.id);
                if (foundDestination) {
                    console.log(`   ✓ Found ${destination.name} (${destination.id})`);
                } else {
                    console.log(`   ⚠️  ${destination.name} (${destination.id}) not in top results`);
                }
            } catch (error) {
                console.error(`❌ Search for "${destination.searchQuery}" failed:`, error.response?.status);
            }
        }

    } catch (error) {
        console.error('❌ Server API Error:', error.response?.status, error.message);
        console.error('   Error details:', error.response?.data);
    }
}

/**
 * Test edge cases and error handling
 */
async function testErrorHandling() {
    console.log('\n🔧 Testing Error Handling...\n');

    try {
        // Test with invalid destination
        console.log('1. Testing invalid destination...');
        const invalidDestResponse = await axios.get(`${SERVER_URL}/hotels/search`, {
            params: {
                destination_id: 'INVALID_ID_12345',
                checkin: testParams.checkin,
                checkout: testParams.checkout,
                guests: testParams.guests
            },
            timeout: 30000
        });
        console.log('   Invalid destination response hotels:', invalidDestResponse.data.hotels?.length || 0);
    } catch (error) {
        console.log('✅ Properly handled invalid destination:', error.response?.status);
    }

    try {
        // Test with invalid dates
        console.log('2. Testing invalid dates...');
        await axios.get(`${SERVER_URL}/hotels/search`, {
            params: {
                destination_id: testParams.destination_id,
                checkin: '2025-08-20',
                checkout: '2025-08-15', // checkout before checkin
                guests: testParams.guests
            }
        });
    } catch (error) {
        console.log('✅ Properly handled invalid dates:', error.response?.status);
    }

    try {
        // Test with missing required fields
        console.log('3. Testing missing required fields...');
        await axios.get(`${SERVER_URL}/hotels/search`, {
            params: {
                destination_id: testParams.destination_id
                // Missing checkin, checkout, guests
            }
        });
    } catch (error) {
        console.log('✅ Properly handled missing fields:', error.response?.status);
    }

    try {
        // Test with dates too close (less than 3 days advance)
        console.log('4. Testing dates too close (< 3 days advance)...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        
        await axios.get(`${SERVER_URL}/hotels/search`, {
            params: {
                destination_id: testParams.destination_id,
                checkin: tomorrow.toISOString().split('T')[0],
                checkout: dayAfter.toISOString().split('T')[0],
                guests: testParams.guests
            }
        });
    } catch (error) {
        console.log('✅ Properly handled dates too close:', error.response?.status);
    }
}

/**
 * Test multiple destinations functionality
 */
async function testMultipleDestinations() {
    console.log('\n🌍 Testing Multiple Destinations...\n');

    for (const destination of testDestinations.slice(0, 2)) { // Test first 2 destinations to save time
        console.log(`\n--- Testing ${destination.name} (${destination.id}) ---`);
        
        try {
            const searchResponse = await axios.get(`${SERVER_URL}/hotels/search`, {
                params: {
                    destination_id: destination.id,
                    checkin: testParams.checkin,
                    checkout: testParams.checkout,
                    guests: testParams.guests,
                    pageSize: 5 // Small page size for testing
                },
                timeout: 25000
            });
            
            console.log(`✅ ${destination.name} - Hotels found: ${searchResponse.data.totalHotels || 0}`);
            if (searchResponse.data.hotels?.length > 0) {
                const hotel = searchResponse.data.hotels[0];
                console.log(`   Top hotel: ${hotel.name} - $${hotel.price}`);
            }
            
        } catch (error) {
            console.error(`❌ ${destination.name} search failed:`, error.response?.status, error.message);
        }
    }
}

/**
 * Run all tests
 */
async function runTests() {
    console.log('🎯 Ascenda API Integration Test Suite');
    console.log('=====================================');
    console.log(`📍 Available test destinations:`);
    testDestinations.forEach(dest => {
        console.log(`   - ${dest.name} (${dest.id}): "${dest.term}"`);
    });
    
    const startTime = Date.now();
    
    await testDirectAscendaAPI();
    await testServerAPI();
    await testMultipleDestinations();
    await testErrorHandling();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n✨ Test Suite Completed');
    console.log(`⏱️  Total duration: ${duration.toFixed(2)} seconds`);
    console.log(`📊 Test Summary:`);
    console.log(`   - Primary destination: ${primaryDestination.name} (${primaryDestination.id})`);
    console.log(`   - Total destinations tested: ${testDestinations.length}`);
}

// Export functions for individual testing
module.exports = {
    testDestinations,
    testDirectAscendaAPI,
    testServerAPI,
    testMultipleDestinations,
    testErrorHandling,
    runTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}
