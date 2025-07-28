const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Product = require('../model/Product');
const { requireAuth } = require('../middleware/authMiddleware');

// 📦 GET all products with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);

    // Get unique categories for filter options
    const categories = await Product.distinct('category');

    return res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
        hasNextPage: skip + products.length < totalProducts,
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        categories: categories.filter(cat => cat), // Remove empty categories
        priceRange: {
          min: await Product.findOne().sort({ price: 1 }).select('price').then(p => p?.price || 0),
          max: await Product.findOne().sort({ price: -1 }).select('price').then(p => p?.price || 0)
        }
      }
    });
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products' 
    });
  }
});

// 📦 GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    return res.json({ 
      success: true, 
      product 
    });
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product' 
    });
  }
});

// 🔍 GET search suggestions (for autocomplete)
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name category')
    .limit(5);

    return res.json({ suggestions });
  } catch (err) {
    console.error('❌ Error fetching search suggestions:', err);
    return res.status(500).json({ suggestions: [] });
  }
});

// 📊 GET product statistics
router.get('/stats/categories', async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: '' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return res.json({
      success: true,
      categoryStats
    });
  } catch (err) {
    console.error('❌ Error fetching category stats:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch category statistics' 
    });
  }
});

// ⭐ GET review analytics
router.get('/stats/reviews', async (req, res) => {
  try {
    const reviewStats = await Product.aggregate([
      {
        $match: {
          numReviews: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: '$numReviews' },
          avgRating: { $avg: '$averageRating' },
          totalProducts: { $sum: 1 },
          topRatedProducts: {
            $push: {
              name: '$name',
              averageRating: '$averageRating',
              numReviews: '$numReviews'
            }
          }
        }
      }
    ]);

    // Get top rated products
    const topRated = await Product.find({ numReviews: { $gt: 0 } })
      .sort({ averageRating: -1, numReviews: -1 })
      .limit(5)
      .select('name averageRating numReviews category');

    // Get recent reviews
    const recentReviews = await Product.aggregate([
      {
        $unwind: '$reviews'
      },
      {
        $sort: { 'reviews.createdAt': -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          productName: '$name',
          review: '$reviews'
        }
      }
    ]);

    return res.json({
      success: true,
      stats: reviewStats[0] || {
        totalReviews: 0,
        avgRating: 0,
        totalProducts: 0
      },
      topRated,
      recentReviews
    });
  } catch (err) {
    console.error('❌ Error fetching review stats:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch review statistics' 
    });
  }
});

// ✍️ POST a review for a product (Protected)
router.post('/:id/reviews', requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 10 characters long'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add new review
    const newReview = {
      user: req.user._id,
      username: req.user.name || req.user.username,
      rating: parseInt(rating),
      comment: comment.trim(),
      createdAt: new Date()
    };

    product.reviews.push(newReview);

    // Calculate new average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = totalRating / product.reviews.length;
    product.numReviews = product.reviews.length;

    await product.save();

    return res.json({
      success: true,
      message: 'Review added successfully',
      review: newReview,
      averageRating: product.averageRating,
      numReviews: product.numReviews
    });
  } catch (err) {
    console.error('❌ Error adding review:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

// 🗑️ DELETE a review (Protected - User can only delete their own review)
router.delete('/:productId/reviews/:reviewId', requireAuth, async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find the review
    const reviewIndex = product.reviews.findIndex(
      review => review._id.toString() === reviewId && 
               review.user.toString() === req.user._id.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it'
      });
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1);

    // Recalculate average rating
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.averageRating = totalRating / product.reviews.length;
    } else {
      product.averageRating = 0;
    }
    product.numReviews = product.reviews.length;

    await product.save();

    return res.json({
      success: true,
      message: 'Review deleted successfully',
      averageRating: product.averageRating,
      numReviews: product.numReviews
    });
  } catch (err) {
    console.error('❌ Error deleting review:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

module.exports = router;
