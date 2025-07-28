const express = require('express');
const router = express.Router();
const Cart = require('../model/Cart');
const Product = require('../model/Product');
const { requireAuth } = require('../middleware/authMiddleware');

// ✅ GET /api/cart - Get current user's cart
router.get('/', requireAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    return res.status(200).json({ items: cart?.items || [] });
  } catch (err) {
    console.error('❌ Error fetching cart:', err);
    return res.status(500).json({ message: 'Failed to fetch cart', error: err.message });
  }
});

// ✅ PUT /api/cart - Save/update current user's cart
router.put('/', requireAuth, async (req, res) => {
  const { items } = req.body;

  // 🛡️ Validate: Must be an array
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid cart format. Expected an array.' });
  }

  // 🔍 Validate: All fields must be present
  const missingFields = items.some(item => 
    !item.productId || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number'
  );
  if (missingFields) {
    return res.status(400).json({ message: 'Each item must have productId, name, price, and quantity' });
  }

  // 🛑 Stock validation
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.name}` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock for ${item.name}. Only ${product.stock} available.` 
      });
    }
  }

  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
      // 📝 Update existing cart
      cart.items = items;
    } else {
      // 🆕 Create new cart
      cart = new Cart({
        userId: req.user._id,
        items,
      });
    }

    await cart.save();
    return res.status(200).json({ message: '✅ Cart saved successfully' });

  } catch (err) {
    console.error('❌ Error saving cart:', err);
    return res.status(500).json({ message: 'Failed to save cart', error: err.message });
  }
});

// ✅ DELETE /api/cart - Clear current user's cart
router.delete('/', requireAuth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { new: true }
    );
    return res.status(200).json({ message: '✅ Cart cleared successfully' });
  } catch (err) {
    console.error('❌ Error clearing cart:', err);
    return res.status(500).json({ message: 'Failed to clear cart', error: err.message });
  }
});

module.exports = router;
