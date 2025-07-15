const express = require('express');
const multer = require('multer');
const { requireAdmin } = require('../middleware/authMiddleware');
const productController = require('../controller/adminProductController');
const { storage } = require('../utils/cloudinary');

const router = express.Router();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB per image
});

// ➕ Create Product
router.post(
  '/',
  requireAdmin,
  upload.array('images', 5),
  productController.createProduct
);

// 📄 Get All Products
router.get('/', requireAdmin, productController.getAllProducts);

// ✏️ Update Product
router.put(
  '/:id',
  requireAdmin,
  upload.array('images', 5),
  productController.updateProduct
);

// ❌ Delete Product
router.delete('/:id', requireAdmin, productController.deleteProduct);

module.exports = router;
