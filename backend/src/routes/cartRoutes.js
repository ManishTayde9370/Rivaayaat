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

  // 🛡️ Validate: Array size limit
  if (items.length > 50) {
    return res.status(400).json({ message: 'Cart cannot contain more than 50 items.' });
  }

  // 🔍 Validate: All fields must be present and valid
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (!item.productId) {
      return res.status(400).json({ 
        message: `Item at index ${i} is missing productId` 
      });
    }
    
    if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
      return res.status(400).json({ 
        message: `Item at index ${i} has invalid name` 
      });
    }
    
    if (typeof item.price !== 'number' || item.price <= 0) {
      return res.status(400).json({ 
        message: `Item at index ${i} has invalid price` 
      });
    }
    
    if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 100) {
      return res.status(400).json({ 
        message: `Item at index ${i} has invalid quantity (must be 1-100)` 
      });
    }
  }

  // 🛑 Stock validation with better error handling
  try {
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.name}` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Only ${product.stock} available.` 
        });
      }
    }
  } catch (error) {
    console.error('❌ Stock validation error:', error);
    return res.status(500).json({ 
      message: 'Failed to validate product stock' 
    });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
      // 📝 Update existing cart
      cart.items = items;
      cart.updatedAt = new Date();
    } else {
      // 🆕 Create new cart
      cart = new Cart({
        userId: req.user._id,
        items,
      });
    }

    await cart.save();
    return res.status(200).json({ 
      message: '✅ Cart saved successfully',
      itemCount: items.length
    });

  } catch (err) {
    console.error('❌ Error saving cart:', err);
    return res.status(500).json({ 
      message: 'Failed to save cart', 
      error: err.message 
    });
  }
});

// ✅ DELETE /api/cart - Clear current user's cart
router.delete('/', requireAuth, async (req, res) => {
  try {
    const result = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { new: true }
    );
    
    return res.status(200).json({ 
      message: '✅ Cart cleared successfully',
      cleared: !!result
    });
  } catch (err) {
    console.error('❌ Error clearing cart:', err);
    return res.status(500).json({ 
      message: 'Failed to clear cart', 
      error: err.message 
    });
  }
});

// ✅ POST /api/cart/add - Add single item to cart
router.post('/add', requireAuth, async (req, res) => {
  const { productId, name, price, quantity = 1 } = req.body;

  // Validate input
  if (!productId || !name || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ 
      message: 'Invalid product data. productId, name, and price are required.' 
    });
  }

  if (typeof quantity !== 'number' || quantity <= 0 || quantity > 100) {
    return res.status(400).json({ 
      message: 'Invalid quantity. Must be between 1 and 100.' 
    });
  }

  try {
    // Check product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${product.stock} available.` 
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      if (cart.items[existingItemIndex].quantity > 100) {
        cart.items[existingItemIndex].quantity = 100;
      }
    } else {
      // Add new item
      cart.items.push({
        productId,
        name,
        price,
        quantity,
        image: product.images?.[0] || ''
      });
    }

    await cart.save();
    return res.status(200).json({ 
      message: '✅ Item added to cart successfully',
      itemCount: cart.items.length
    });

  } catch (err) {
    console.error('❌ Error adding item to cart:', err);
    return res.status(500).json({ 
      message: 'Failed to add item to cart', 
      error: err.message 
    });
  }
});

// ✅ DELETE /api/cart/remove/:productId - Remove item from cart
router.delete('/remove/:productId', requireAuth, async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => 
      item.productId.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cart.save();
    return res.status(200).json({ 
      message: '✅ Item removed from cart successfully',
      itemCount: cart.items.length
    });

  } catch (err) {
    console.error('❌ Error removing item from cart:', err);
    return res.status(500).json({ 
      message: 'Failed to remove item from cart', 
      error: err.message 
    });
  }
});

module.exports = router;
