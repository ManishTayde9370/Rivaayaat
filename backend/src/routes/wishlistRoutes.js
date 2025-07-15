const express = require('express');
const router = express.Router();
const User = require('../model/Users');
const Product = require('../model/Product');
const { requireAuth } = require('../middleware/authMiddleware');

// @POST /api/wishlist/:productId
router.post('/:productId', requireAuth, async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    const alreadyInWishlist = user.wishlist.some(item => item.product.toString() === productId);

    if (alreadyInWishlist) {
      user.wishlist = user.wishlist.filter(item => item.product.toString() !== productId);
      await user.save();
      return res.json({ message: 'Removed from wishlist' });
    } else {
      user.wishlist.push({ product: productId, addedAt: new Date() });
      await user.save();
      return res.json({ message: 'Added to wishlist' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/wishlist
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist.product');
    // Return array of { ...product fields, addedAt }
    const wishlistWithDetails = user.wishlist.map(item => ({
      ...item.product.toObject(),
      addedAt: item.addedAt
    }));
    res.json(wishlistWithDetails);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
