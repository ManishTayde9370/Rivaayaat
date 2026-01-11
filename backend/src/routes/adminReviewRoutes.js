const express = require('express');
const router = express.Router();
const Product = require('../model/Product');
const { requireAdmin } = require('../middleware/authMiddleware');

// GET /api/admin/reviews/pending - list pending reviews
router.get('/pending', requireAdmin, async (req, res) => {
  try {
    const pending = await Product.aggregate([
      { $unwind: '$reviews' },
      { $match: { 'reviews.approved': false } },
      { $sort: { 'reviews.createdAt': -1 } },
      { $project: {
          productId: '$_id',
          productName: '$name',
          review: '$reviews'
      }}
    ]);

    return res.json({ success: true, pending });
  } catch (err) {
    console.error('List pending reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to list pending reviews' });
  }
});

// POST /api/admin/reviews/approve/:productId/:reviewId - approve a review
router.post('/approve/:productId/:reviewId', requireAdmin, async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.approved = true;

    // Recalculate averages using approved reviews only
    const approvedReviews = product.reviews.filter(r => r.approved);
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      product.averageRating = totalRating / approvedReviews.length;
      product.numReviews = approvedReviews.length;
    } else {
      product.averageRating = 0;
      product.numReviews = 0;
    }

    await product.save();

    return res.json({ success: true, message: 'Review approved', review });
  } catch (err) {
    console.error('Approve review error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve review' });
  }
});

// DELETE /api/admin/reviews/reject/:productId/:reviewId - reject (delete) a review
router.delete('/reject/:productId/:reviewId', requireAdmin, async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
    if (reviewIndex === -1) return res.status(404).json({ success: false, message: 'Review not found' });

    product.reviews.splice(reviewIndex, 1);

    // Recalculate averages using approved reviews only
    const approvedReviews = product.reviews.filter(r => r.approved);
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      product.averageRating = totalRating / approvedReviews.length;
      product.numReviews = approvedReviews.length;
    } else {
      product.averageRating = 0;
      product.numReviews = 0;
    }

    await product.save();

    return res.json({ success: true, message: 'Review rejected and removed' });
  } catch (err) {
    console.error('Reject review error:', err);
    res.status(500).json({ success: false, message: 'Failed to reject review' });
  }
});

module.exports = router;
