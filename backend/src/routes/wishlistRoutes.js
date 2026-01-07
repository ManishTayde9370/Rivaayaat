const express = require('express');
const router = express.Router();
const User = require('../model/Users');
const { requireAuth } = require('../middleware/authMiddleware');

// @POST /api/wishlist/:productId - Toggle wishlist item
router.post('/:productId', requireAuth, async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    
    // Check if product is already in wishlist
    const existingItem = user.wishlist.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(item => item.product.toString() !== productId);
      await user.save();
      
      return res.json({ 
        success: true,
        message: 'Removed from wishlist',
        action: 'removed'
      });
    } else {
      // Add to wishlist
      user.wishlist.push({ product: productId, addedAt: new Date() });
      await user.save();
      
      return res.json({ 
        success: true,
        message: 'Added to wishlist',
        action: 'added'
      });
    }
  } catch (err) {
    console.error('Wishlist toggle error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update wishlist' 
    });
  }
});

// @DELETE /api/wishlist/:productId - Remove specific item from wishlist
router.delete('/:productId', requireAuth, async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    
    // Remove from wishlist
    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(item => item.product.toString() !== productId);
    
    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in wishlist' 
      });
    }
    
    await user.save();
    
    return res.json({ 
      success: true,
      message: 'Removed from wishlist' 
    });
  } catch (err) {
    console.error('Wishlist remove error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to remove from wishlist' 
    });
  }
});

// @GET /api/wishlist - Get user's wishlist
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist.product');
    
    // Return array of { ...product fields, addedAt }
    const wishlistWithDetails = user.wishlist.map(item => ({
      ...item.product.toObject(),
      addedAt: item.addedAt
    }));
    
    return res.json(wishlistWithDetails);
  } catch (err) {
    console.error('Fetch wishlist error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch wishlist' 
    });
  }
});

module.exports = router;
