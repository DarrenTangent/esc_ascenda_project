const NodeCache = require("node-cache");
const fs = require('fs');
const path = require('path');

const hotelsPath = path.join(__dirname, '..', 'data', 'fakedata.json');
const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf-8'));

// TODO: get all hotels for the destination through the api call to get hotel name, picture etc
class HotelService {
    constructor() {
        this.myCache = new NodeCache({ stdTTL: 6000 });
    }

    async getHotels(req) {
        const pageSize = 30;
        const page = parseInt(req.query.page) || 1;
        const maxCost = parseInt(req.query.maxCost) || null;
        const minCost = parseInt(req.query.minCost) || null;
        const destination = req.query.destination_id;
        const checkin = req.query.checkin;
        const checkout = req.query.checkout;
        const guests = req.query.guests;

        const hotelPrices = await this.getHotelPrices(destination, checkin, checkout, guests);
        const hotelDetails = await this.getHotelDetails(destination);
        let hotelCombined = this.getHotelCombined(hotelPrices, hotelDetails);

        // filtering
        if (minCost != null) hotelCombined = hotelCombined.filter(hotel => minCost <= hotel.price);
        if (maxCost != null) hotelCombined = hotelCombined.filter(hotel => hotel.price <= maxCost);
    
        // pagination
        const totalPages = Math.ceil(hotelCombined.length / pageSize);
        const paginatedHotels = hotelCombined.slice((page - 1) * pageSize, page * pageSize);
        return {"page": page, "totalPages": totalPages, "paginatedHotels": paginatedHotels};
    }

    async getSingleHotelDetails(req, id) {
        const destination = req.query.destination_id;
        const checkin = req.query.checkin;
        const checkout = req.query.checkout;
        const guests = req.query.guests;
        let fullHotelDetails = {};

        const roomDetailsUrl = `https://hotelapi.loyalty.dev/api/hotels/${id}/price?destination_id=${destination}&checkin=${checkin}&checkout=${checkout}&currency=SGD&country_code=SG&guests=${guests}&partner_id=1`
        const hotelDetailsUrl = `https://hotelapi.loyalty.dev/api/hotels/${id}`

        const cachedData = this.myCache.get(id);
        if (cachedData) {
            fullHotelDetails = cachedData;
        }
        else {
            const rawRoomDetails = await fetch(roomDetailsUrl);
            const roomDetails = await rawRoomDetails.json();

            const rawHotelDetails = await fetch(hotelDetailsUrl);
            const hotelDetails = await rawHotelDetails.json();

            fullHotelDetails.rooms = roomDetails.rooms;
            fullHotelDetails.hotelDetails = hotelDetails;

            console.log(fullHotelDetails);

            this.myCache.set(id, fullHotelDetails);
        }
        return fullHotelDetails;
    }

    getHotelCombined(hotelPrices, hotelDetails) {
        const query = `${hotelPrices.toString()} ${hotelDetails.toString()}`
        let hotelCombined = [];
        const cachedData = this.myCache.get(query);
        if (cachedData) {
            hotelCombined = cachedData;
        }
        else {
            for (const hotel of hotelPrices) {
                const hotelDetail = hotelDetails.find(hotelDetail => hotelDetail.id === hotel.id);
                if (hotelDetail) {
                    hotelCombined.push({
                        "id": hotel.id,
                        "searchRank": hotel.searchRank,
                        "free_cancellation": hotel.free_cancellation,
                        "rooms_available": hotel.rooms_available,
                        "price": hotel.price,
                        "latitude": hotelDetail.latitude,
                        "longitude": hotelDetail.longitude,
                        "name": hotelDetail.name,
                        "address": hotelDetail.address,
                        "rating": hotelDetail.rating,
                        "amenities_ratings": hotelDetail.amenities_ratings,
                        "description": hotelDetail.description,
                        "amenities": hotelDetail.amenities,
                        "image_details": hotelDetail.image_details,
                        "hires_image_index": hotelDetail.hires_image_index
                    });
                }            
            }
        }
        return hotelCombined;
    }

    // TODO: handle empty params
    async getHotelPrices(destination, checkin, checkout, guests) {
        let hotelPrices = {};
        const query = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${destination}&checkin=${checkin}&checkout=${checkout}&currency=SGD&guests=${guests}&partner_id=1`;
        const cachedData = this.myCache.get(query);
        if (cachedData) {
            hotelPrices = cachedData;
        }
        else {
            // TODO: TRY AT LEAST 3 TIMES CAUSE QUERY TAKES SOME TIME TO LOAD
            // OH ACTUALLY CAN KEEP TRYING UNTIL THE "completed" PARAM IN THE REQUEST IS "true"

            // comment when given api not working
            // const rawPricesData = await fetch(query);
            // const jsonPricesData = await rawPricesData.json();
            const jsonPricesData = hotels;
            hotelPrices = jsonPricesData.hotels;

            this.myCache.set(query, hotelPrices);
        }
        return hotelPrices;
    }
    
    async getHotelDetails(destination) {
        let hotelDetails = [];
        const baseUrl = "https://hotelapi.loyalty.dev/api/hotels?destination_id="
        const cachedData = this.myCache.get(destination);
        if (cachedData) {
            hotelDetails = cachedData;
        }
        else {
            const rawHotelDetails = await fetch(baseUrl + destination);
            hotelDetails = await rawHotelDetails.json();
            this.myCache.set(destination, hotelDetails);
        }
        return hotelDetails;
    }


}

module.exports = new HotelService();
