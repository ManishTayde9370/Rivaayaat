const express = require('express'); 
const router = express.Router();

const Product = require('../model/Product');
const User = require('../model/Users');
const { requireAuth } = require('../middleware/authMiddleware');


// 📦 GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// 📦 GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ product });
  } catch (err) {
    console.error(`❌ Error fetching product with ID ${req.params.id}:`, err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// ✍️ POST a review for a product (Protected)
router.post('/:id/reviews', requireAuth, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ❌ Prevent duplicate reviews from the same user
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    const newReview = {
      user: req.user._id,
      username: req.user.name,
      rating: Number(rating),
      comment,
    };

    // ✅ Add review
    product.reviews.push(newReview);
    product.numReviews = product.reviews.length;

    // ⭐ Update average rating
    product.averageRating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    return res.status(201).json({ message: 'Review added', reviews: product.reviews });
  } catch (err) {
    console.error(`❌ Error posting review for product ${req.params.id}:`, err);
    return res.status(500).json({ message: 'Error adding review', error: err.message });
  }
});

module.exports = router;
