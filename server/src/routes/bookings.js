import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';

const router = Router();

// Create booking
router.post('/', auth, async (req, res) => {
  const payload = req.body || {};
  const doc = await Booking.create({
    ...payload,
    userId: req.user._id,
    memberName: req.user.name,
    status: payload.status || 'Pending',
  });
  res.status(201).json({ booking: doc });
});

// My bookings
router.get('/me', auth, async (req, res) => {
  const list = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ bookings: list });
});

// Admin list all
router.get('/', auth, requireRole('admin', 'manager'), async (_req, res) => {
  const list = await Booking.find().sort({ createdAt: -1 });
  res.json({ bookings: list });
});

// Update booking status (approve/reject)
router.patch('/:id/status', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: pending, approved, rejected' 
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Only allow status transition if current status is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update status from ${booking.status} to ${status}` 
      });
    }

    booking.status = status;
    booking.updatedAt = new Date();
    
    // If approved, you might want to perform additional actions here
    // For example, send approval email, create related records, etc.
    
    await booking.save();
    
    res.json({ 
      success: true, 
      booking,
      message: `Booking ${status} successfully`
    });
    
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking status',
      error: error.message 
    });
  }
});

export default router;
