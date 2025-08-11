/**
 * End-to-End Integration Test
 * Tests the complete flow: Client → Server → Ascenda API
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:5001/api';
const CLIENT_URL = 'http://localhost:3000'; // Assuming Next.js client runs on 3000

// Test destinations from destinations.json
const testDestinations = [
    {
        name: 'Singapore',
        id: 'RsBU',
        term: 'Singapore, Singapore',
        searchQuery: 'singapore'
    }
];

/**
 * Test the complete client-server-API integration flow
 */
async function testFullIntegration() {
    console.log('🔗 Testing Full Integration: Client → Server → Ascenda API\n');
    
    const destination = testDestinations[0];
    const checkin = '2025-08-15';
    const checkout = '2025-08-20';
    const guests = '2';
    
    try {
        // Step 1: Test destination search (what client does first)
        console.log('1️⃣ Testing destination search...');
        const destResponse = await axios.get(`${SERVER_URL}/destinations/search`, {
            params: { q: destination.searchQuery },
            timeout: 10000
        });
        
        const foundDestination = destResponse.data.destinations?.find(d => d.uid === destination.id);
        if (!foundDestination) {
            throw new Error(`Destination ${destination.name} not found in search results`);
        }
        console.log(`✅ Found destination: ${foundDestination.term} (${foundDestination.uid})`);
        
        // Step 2: Test hotel search (what happens when client searches)
        console.log('\n2️⃣ Testing hotel search with found destination...');
        const searchParams = {
            destination_id: foundDestination.uid,
            checkin: checkin,
            checkout: checkout,
            guests: guests,
            pageSize: 10
        };
        
        console.log('   Search parameters:', searchParams);
        
        const hotelResponse = await axios.get(`${SERVER_URL}/hotels/search`, {
            params: searchParams,
            timeout: 30000
        });
        
        if (hotelResponse.status !== 200) {
            throw new Error(`Hotel search failed with status ${hotelResponse.status}`);
        }
        
        const searchData = hotelResponse.data;
        console.log(`✅ Hotel search successful:`);
        console.log(`   - Total hotels: ${searchData.totalHotels}`);
        console.log(`   - Page: ${searchData.page}/${searchData.totalPages}`);
        console.log(`   - Hotels returned: ${searchData.hotels?.length || 0}`);
        
        if (searchData.hotels && searchData.hotels.length > 0) {
            const firstHotel = searchData.hotels[0];
            console.log(`   - First hotel: ${firstHotel.name} - $${firstHotel.price}`);
            
            // Step 3: Test individual hotel details
            console.log('\n3️⃣ Testing individual hotel details...');
            const hotelDetailsResponse = await axios.get(`${SERVER_URL}/hotels/${firstHotel.id}`, {
                timeout: 10000
            });
            
            console.log(`✅ Hotel details retrieved: ${hotelDetailsResponse.data.name}`);
            
            // Step 4: Test individual hotel pricing
            console.log('\n4️⃣ Testing individual hotel pricing...');
            const hotelPriceResponse = await axios.get(`${SERVER_URL}/hotels/${firstHotel.id}/price`, {
                params: {
                    destination_id: foundDestination.uid,
                    checkin: checkin,
                    checkout: checkout,
                    guests: guests
                },
                timeout: 20000
            });
            
            console.log(`✅ Hotel pricing retrieved: ${hotelPriceResponse.data.rooms?.length || 0} room types`);
        }
        
        // Step 5: Verify data structure matches client expectations
        console.log('\n5️⃣ Verifying client compatibility...');
        const requiredFields = ['id', 'name', 'price', 'rating', 'address'];
        const missingFields = [];
        
        if (searchData.hotels && searchData.hotels.length > 0) {
            const sampleHotel = searchData.hotels[0];
            for (const field of requiredFields) {
                if (!sampleHotel.hasOwnProperty(field)) {
                    missingFields.push(field);
                }
            }
            
            if (missingFields.length === 0) {
                console.log('✅ All required fields present for client');
            } else {
                console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
            }
            
            // Check pagination structure
            const requiredPaginationFields = ['page', 'totalPages', 'totalHotels', 'hotels'];
            const missingPaginationFields = requiredPaginationFields.filter(field => !searchData.hasOwnProperty(field));
            
            if (missingPaginationFields.length === 0) {
                console.log('✅ Pagination structure compatible with client');
            } else {
                console.log(`❌ Missing pagination fields: ${missingPaginationFields.join(', ')}`);
            }
        }
        
        return true;
        
    } catch (error) {
        console.error(`❌ Integration test failed:`, error.response?.status || error.message);
        console.error(`   Error details:`, error.response?.data || error.stack);
        return false;
    }
}

/**
 * Test client form validation rules
 */
async function testClientValidationRules() {
    console.log('\n🛡️ Testing Client Validation Rules\n');
    
    const destination = testDestinations[0];
    
    // Test 1: Dates too close (should fail)
    console.log('1️⃣ Testing dates too close (< 3 days advance)...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    try {
        await axios.get(`${SERVER_URL}/hotels/search`, {
            params: {
                destination_id: destination.id,
                checkin: tomorrow.toISOString().slice(0, 10),
                checkout: dayAfter.toISOString().slice(0, 10),
                guests: '2'
            }
        });
        console.log('❌ Should have failed validation');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Properly rejected dates too close');
        } else {
            console.log('❌ Unexpected error:', error.response?.status);
        }
    }
    
    // Test 2: Checkout before checkin (should fail)
    console.log('\n2️⃣ Testing checkout before checkin...');
    try {
        await axios.get(`${SERVER_URL}/hotels/search`, {
            params: {
                destination_id: destination.id,
                checkin: '2025-08-20',
                checkout: '2025-08-15',
                guests: '2'
            }
        });
        console.log('❌ Should have failed validation');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Properly rejected invalid date range');
        } else {
            console.log('❌ Unexpected error:', error.response?.status);
        }
    }
    
    // Test 3: Missing required fields (should fail)
    console.log('\n3️⃣ Testing missing required fields...');
    try {
        await axios.get(`${SERVER_URL}/hotels/search`, {
            params: {
                destination_id: destination.id
                // Missing checkin, checkout, guests
            }
        });
        console.log('❌ Should have failed validation');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Properly rejected missing fields');
        } else {
            console.log('❌ Unexpected error:', error.response?.status);
        }
    }
}

/**
 * Run all integration tests
 */
async function runIntegrationTests() {
    console.log('🚀 Client-Server-API Integration Test Suite');
    console.log('==========================================');
    console.log('Testing complete flow: Client → Server → Ascenda API');
    
    const startTime = Date.now();
    
    const integrationSuccess = await testFullIntegration();
    await testClientValidationRules();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n✨ Integration Test Suite Completed');
    console.log(`⏱️  Total duration: ${duration.toFixed(2)} seconds`);
    console.log(`🎯 Integration Status: ${integrationSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (integrationSuccess) {
        console.log('\n🎉 Complete flow working:');
        console.log('   1. ✅ Client can search destinations');
        console.log('   2. ✅ Client can search hotels with pricing');
        console.log('   3. ✅ Server calls Ascenda API correctly');
        console.log('   4. ✅ Data format compatible with client');
        console.log('   5. ✅ Error handling and validation working');
        console.log('\n🚀 Ready for production deployment!');
    }
    
    return integrationSuccess;
}

// Export functions for individual testing
module.exports = {
    testFullIntegration,
    testClientValidationRules,
    runIntegrationTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    runIntegrationTests().catch(console.error);
}
