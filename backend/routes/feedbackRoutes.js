const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const feedback = new Feedback({
      ...req.body,
      member: req.user.id
    });
    
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback (admin) or user's feedback
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's feedback
    if (req.user.role !== 'admin') {
      query.member = req.user.id;
    }
    
    const feedbacks = await Feedback.find(query)
      .populate('member', 'fullName email')
      .populate('response.respondedBy', 'name');
      
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/feedback/:id/respond
// @desc    Respond to feedback (admin only)
// @access  Private/Admin
router.put('/:id/respond', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { message } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        response: {
          message,
          respondedBy: req.user.id,
          respondedAt: Date.now()
        }
      },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics
// @access  Private/Admin
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const stats = {
      total: await Feedback.countDocuments(),
      new: await Feedback.countDocuments({ status: 'new' }),
      inReview: await Feedback.countDocuments({ status: 'in_review' }),
      resolved: await Feedback.countDocuments({ status: 'resolved' }),
      byType: await Feedback.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      byCategory: await Feedback.aggregate([
        { $unwind: '$category' },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    };
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
