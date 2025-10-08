const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { Plot, Booking } = require('../models/Plot');

// @route   POST /api/plots
// @desc    Add a new plot
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    const plot = new Plot(req.body);
    await plot.save();
    res.status(201).json(plot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/plots
// @desc    Get all plots
// @access  Public
router.get('/', async (req, res) => {
  try {
    const plots = await Plot.find();
    res.json(plots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/plots/book
// @desc    Book a plot
// @access  Public (temporarily set to public for testing)
router.post('/book', async (req, res) => {
  try {
    console.log('Received booking request:', req.body);
    
    const { 
      plotId, 
      fullName, 
      email, 
      phone, 
      startDate, 
      duration, 
      paymentMethod, 
      specialRequests 
    } = req.body;
    
    // Basic validation
    if (!plotId || !fullName || !email || !phone || !startDate || !duration || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields' 
      });
    }
    
    // Check if plot exists and is available
    const plot = await Plot.findById(plotId);
    if (!plot) {
      return res.status(404).json({ 
        success: false,
        message: 'Plot not found' 
      });
    }
    
    if (plot.status !== 'available') {
      return res.status(400).json({ 
        success: false,
        message: 'Plot is not available for booking' 
      });
    }
    
    // Calculate end date based on duration
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(duration));
    
    // Calculate total amount
    const months = Math.ceil((endDate - new Date(startDate)) / (30 * 24 * 60 * 60 * 1000));
    const totalAmount = months * plot.pricePerMonth;
    
    // Create booking
    const booking = new Booking({
      plot: plotId,
      member: null, // In a real app, this would be the logged-in user's ID
      fullName,
      email,
      phone,
      startDate,
      endDate,
      duration: parseInt(duration),
      paymentMethod,
      specialRequests: specialRequests || '',
      totalAmount,
      status: 'pending' // pending, confirmed, cancelled
    });
    
    await booking.save();
    
    // Update plot status
    plot.status = 'booked';
    await plot.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      bookingId: booking._id,
      plotNumber: plot.plotNumber,
      totalAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/plots/bookings
// @desc    Get all bookings (admin) or user's bookings
// @access  Private
router.get('/bookings', auth, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's bookings
    if (req.user.role !== 'admin') {
      query.member = req.user.id;
    }
    
    const bookings = await Booking.find(query)
      .populate('plot', 'plotNumber size location')
      .populate('member', 'fullName email');
      
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/plots/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized
    if (req.user.role !== 'admin' && booking.member.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // Update plot status to available
    await Plot.findByIdAndUpdate(booking.plot, { status: 'available' });
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
