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
  const { destination_id, checkin, checkout } = req.query;
  
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
  
  if (isNaN(checkinDate.getTime())) {
    return res.status(400).json({ 
      error: 'Invalid check-in date format',
      field: 'checkin'
    });
  }
  
  if (isNaN(checkoutDate.getTime())) {
    return res.status(400).json({ 
      error: 'Invalid check-out date format',
      field: 'checkout'
    });
  }
  
  if (checkinDate < today) {
    return res.status(400).json({ 
      error: 'Check-in date cannot be in the past',
      field: 'checkin'
    });
  }
  
  if (checkoutDate <= checkinDate) {
    return res.status(400).json({ 
      error: 'Check-out date must be after check-in date',
      field: 'checkout'
    });
  }
  
  // Optional: Validate guests and rooms
  const { guests, rooms } = req.query;
  
  if (guests && (isNaN(guests) || parseInt(guests) < 1 || parseInt(guests) > 20)) {
    return res.status(400).json({ 
      error: 'Guests must be a number between 1 and 20',
      field: 'guests'
    });
  }
  
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

module.exports = {
  validateDestinationSearch,
  validateHotelSearch,
  validatePagination
};
