const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const auth = require('../Middle/auth');

// Update OneSignal player ID for logged-in user
router.put('/onesignal-player-id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oneSignalPlayerId } = req.body;

    if (!oneSignalPlayerId) {
      return res.status(400).json({ success: false, message: 'Player ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.oneSignalPlayerId = oneSignalPlayerId;
    await user.save();

    res.status(200).json({ success: true, message: 'Player ID updated successfully' });
  } catch (error) {
    console.error('Error updating player ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
