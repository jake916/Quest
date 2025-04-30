
const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const auth = require('../Middle/auth');
const upload = require('../Middle/upload');
const cloudinary = require('../Config/cloudinary');


  
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

// Update user profile (username, email, profileImage)
router.put('/update-profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, profileImage } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'Username and email are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if email is changed and unique
    if (email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    user.username = username;
    user.email = email.toLowerCase();
    if (profileImage) {
      user.profileImage = profileImage;
    }
    await user.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully', username: user.username, email: user.email, profileImage: user.profileImage });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Upload profile image
router.post('/upload-profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_images',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.profileImage = result.secure_url;
    await user.save();

    res.status(200).json({ success: true, profileImage: user.profileImage });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

  
// Update user profile (username, email)
router.put('/update-profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'Username and email are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if email is changed and unique
    if (email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    user.username = username;
    user.email = email.toLowerCase();
    await user.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully', username: user.username, email: user.email });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
