// Validation middleware for API requests

const validateDestinationSearch = (req, res, next) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ 
      error: 'Search query is required',
      field: 'q'
    });
  }
  
  if (q.length < 2) {
    return res.status(400).json({ 
      error: 'Search query must be at least 2 characters long',
      field: 'q'
    });
  }
  
  next();
};

const validateHotelSearch = (req, res, next) => {
  const { destination_id, checkin, checkout, guests } = req.query;
  
  // Required fields
  if (!destination_id) {
    return res.status(400).json({ 
      error: 'Destination ID is required',
      field: 'destination_id'
    });
  }
  
  if (!checkin) {
    return res.status(400).json({ 
      error: 'Check-in date is required',
      field: 'checkin'
    });
  }
  
  if (!checkout) {
    return res.status(400).json({ 
      error: 'Check-out date is required',
      field: 'checkout'
    });
  }
  
  // Date validation
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Add 3 days minimum advance booking requirement per Ascenda docs
  const minCheckinDate = new Date(today);
  minCheckinDate.setDate(today.getDate() + 3);
  
  if (isNaN(checkinDate.getTime())) {
    return res.status(400).json({ 
      error: 'Invalid check-in date format. Use YYYY-MM-DD',
      field: 'checkin'
    });
  }
  
  if (isNaN(checkoutDate.getTime())) {
    return res.status(400).json({ 
      error: 'Invalid check-out date format. Use YYYY-MM-DD',
      field: 'checkout'
    });
  }
  
  if (checkinDate < minCheckinDate) {
    return res.status(400).json({ 
      error: 'Check-in date must be at least 3 days in advance',
      field: 'checkin'
    });
  }
  
  if (checkoutDate <= checkinDate) {
    return res.status(400).json({ 
      error: 'Check-out date must be after check-in date',
      field: 'checkout'
    });
  }

  if (guests && (isNaN(guests) || parseInt(guests) < 1 || parseInt(guests) > 20)) {
    return res.status(400).json({ 
      error: 'Guests must be a number between 1 and 20',
      field: 'guests'
    });
  }
  
  // Optional: Validate guests and rooms
  const { rooms } = req.query;
  
  if (rooms && (isNaN(rooms) || parseInt(rooms) < 1 || parseInt(rooms) > 10)) {
    return res.status(400).json({ 
      error: 'Rooms must be a number between 1 and 10',
      field: 'rooms'
    });
  }
  
  next();
};

const validatePagination = (req, res, next) => {
  const { limit, offset } = req.query;
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({ 
      error: 'Limit must be a number between 1 and 100',
      field: 'limit'
    });
  }
  
  if (offset && (isNaN(offset) || parseInt(offset) < 0)) {
    return res.status(400).json({ 
      error: 'Offset must be a non-negative number',
      field: 'offset'
    });
  }
  
  next();
};

const validateHotelId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ 
      error: 'Hotel ID is required',
      field: 'id'
    });
  }
  
  if (typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Hotel ID must be a non-empty string',
      field: 'id'
    });
  }
  
  next();
};

const validateHotelPrice = (req, res, next) => {
  const { id } = req.params;
  const { destination_id, checkin, checkout } = req.query;
  
  // Validate hotel ID first
  if (!id) {
    return res.status(400).json({ 
      error: 'Hotel ID is required',
      field: 'id'
    });
  }
  
  // Required fields for price search
  if (!destination_id) {
    return res.status(400).json({ 
      error: 'Destination ID is required',
      field: 'destination_id'
    });
  }
  
  if (!checkin) {
    return res.status(400).json({ 
      error: 'Check-in date is required',
      field: 'checkin'
    });
  }
  
  if (!checkout) {
    return res.status(400).json({ 
      error: 'Check-out date is required',
      field: 'checkout'
    });
  }
  
  // Date validation
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Add 3 days minimum advance booking requirement per Ascenda docs
  const minCheckinDate = new Date(today);
  minCheckinDate.setDate(today.getDate() + 3);
  
  if (isNaN(checkinDate.getTime())) {
    return res.status(400).json({ 
      error: 'Invalid check-in date format. Use YYYY-MM-DD',
      field: 'checkin'
    });
  }
  
  if (isNaN(checkoutDate.getTime())) {
    return res.status(400).json({ 
      error: 'Invalid check-out date format. Use YYYY-MM-DD',
      field: 'checkout'
    });
  }
  
  if (checkinDate < minCheckinDate) {
    return res.status(400).json({ 
      error: 'Check-in date must be at least 3 days in advance',
      field: 'checkin'
    });
  }
  
  if (checkoutDate <= checkinDate) {
    return res.status(400).json({ 
      error: 'Check-out date must be after check-in date',
      field: 'checkout'
    });
  }
  
  next();
};

module.exports = {
  validateDestinationSearch,
  validateHotelSearch,
  validateHotelId,
  validateHotelPrice,
  validatePagination
};
