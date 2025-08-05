const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

router.post('/', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

router.get('/:id', async(req,res) => {
  try{
    const booking = await Booking.findById(req.params.id);
    if(!booking){
      return res.status(404).json({error: 'Booking not found'});
    } 
    res.json(booking);
  }
  catch (err){
    res.status(500).json({error: 'Server error, please try again later'});
  }
});

module.exports = router;
