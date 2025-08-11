// Utility functions for the server

/**
 * Format date to YYYY-MM-DD format
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Parse date from string
 * @param {string} dateString - Date string
 * @returns {Date} - Date object
 */
const parseDate = (dateString) => {
  return new Date(dateString);
};

/**
 * Calculate number of nights between two dates
 * @param {string} checkin - Check-in date string
 * @param {string} checkout - Check-out date string
 * @returns {number} - Number of nights
 */
const calculateNights = (checkin, checkout) => {
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Sanitize search query
 * @param {string} query - Search query
 * @returns {string} - Sanitized query
 */
const sanitizeQuery = (query) => {
  if (!query) return '';
  return query.trim().replace(/[<>]/g, '').substring(0, 100);
};

/**
 * Format guests parameter for Ascenda API
 * Handles single room and multiple rooms with pipe separators
 * @param {string|number} guests - Number of guests per room or pipe-separated string
 * @param {number} rooms - Number of rooms (default: 1)
 * @returns {string} - Formatted guests string for API
 */
const formatGuestsForAPI = (guests, rooms = 1) => {
  if (!guests) return '2'; // Default to 2 guests
  
  // If already formatted with pipes, return as is
  if (typeof guests === 'string' && guests.includes('|')) {
    return guests;
  }
  
  const guestsPerRoom = parseInt(guests) || 2;
  
  // For single room
  if (rooms === 1) {
    return guestsPerRoom.toString();
  }
  
  // For multiple rooms, repeat guests with pipe separator
  return Array(rooms).fill(guestsPerRoom).join('|');
};

/**
 * Parse guests string from API format
 * @param {string} guestsString - Pipe-separated guests string
 * @returns {object} - Parsed guests info { totalGuests, rooms, guestsPerRoom }
 */
const parseGuestsFromAPI = (guestsString) => {
  if (!guestsString) {
    return { totalGuests: 2, rooms: 1, guestsPerRoom: [2] };
  }
  
  const guestsPerRoom = guestsString.split('|').map(g => parseInt(g) || 2);
  const totalGuests = guestsPerRoom.reduce((sum, guests) => sum + guests, 0);
  
  return {
    totalGuests,
    rooms: guestsPerRoom.length,
    guestsPerRoom
  };
};

/**
 * Build image URL from Ascenda image details
 * @param {object} imageDetails - Image details from API
 * @param {number} index - Image index (default: 0)
 * @returns {string} - Full image URL
 */
const buildImageUrl = (imageDetails, index = 0) => {
  if (!imageDetails || !imageDetails.prefix || !imageDetails.suffix) {
    return '';
  }
  
  const { prefix, suffix, count } = imageDetails;
  const imageIndex = Math.min(index, (count || 1) - 1);
  
  return `${prefix}${imageIndex}${suffix}`;
};

/**
 * Generate cache key for search results
 * @param {object} params - Search parameters
 * @returns {string} - Cache key
 */
const generateCacheKey = (params) => {
  return JSON.stringify(params).replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Format price with currency
 * @param {number} amount - Price amount
 * @param {string} currency - Currency code
 * @returns {string} - Formatted price
 */
const formatPrice = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = {
  formatDate,
  parseDate,
  calculateNights,
  sanitizeQuery,
  formatGuestsForAPI,
  parseGuestsFromAPI,
  buildImageUrl,
  generateCacheKey,
  debounce,
  formatPrice,
  calculateDistance
};
