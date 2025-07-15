const Product = require('../model/Product');
const { cloudinary } = require('../utils/cloudinary'); // 👈 Make sure this is setup

// ➕ Add Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name?.trim() || !description?.trim() || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, description, price, stock)',
      });
    }

    const images = Array.isArray(req.files)
      ? req.files.map((file) => file.path)
      : [];

    const newProduct = new Product({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      category: category?.trim() || '',
      images,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: '✅ Product created successfully',
      product: newProduct,
    });
  } catch (err) {
    console.error('❌ Product creation error:', err);
    return res.status(500).json({ success: false, message: 'Error creating product' });
  }
};

// 📄 Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error('❌ Fetch products error:', err);
    return res.status(500).json({ success: false, message: 'Error fetching products' });
  }
};

// ✏️ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const updateData = {
      name: name?.trim(),
      description: description?.trim(),
      price: Number(price),
      stock: Number(stock),
      category: category?.trim() || '',
    };

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If new images uploaded, delete old ones from Cloudinary
    if (Array.isArray(req.files) && req.files.length > 0) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        for (const imgUrl of product.images) {
          try {
            const parts = imgUrl.split('/');
            const fileName = parts[parts.length - 1]; // abcxyz.jpg
            const publicIdWithExt = fileName.split('.')[0]; // abcxyz
            const folder = 'rivaayaat_products'; // Your folder name
            const public_id = `${folder}/${publicIdWithExt}`;

            await cloudinary.uploader.destroy(public_id);
          } catch (err) {
            console.warn(`⚠️ Failed to delete image from Cloudinary: ${imgUrl}`);
          }
        }
      }

      updateData.images = req.files.map((file) => file.path);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    return res.json({
      success: true,
      message: '✅ Product updated successfully',
      product: updated,
    });
  } catch (err) {
    console.error('❌ Update product error:', err);
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// ❌ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete Cloudinary images
    if (Array.isArray(product.images) && product.images.length > 0) {
      for (const imgUrl of product.images) {
        try {
          const parts = imgUrl.split('/');
          const fileName = parts[parts.length - 1]; // abcxyz.jpg
          const publicIdWithExt = fileName.split('.')[0]; // abcxyz
          const folder = 'rivaayaat_products';
          const public_id = `${folder}/${publicIdWithExt}`;

          await cloudinary.uploader.destroy(public_id);
        } catch (err) {
          console.warn(`⚠️ Failed to delete image from Cloudinary: ${imgUrl}`);
        }
      }
    }

    await product.deleteOne(); // ✅ Replaces deprecated .remove()

    return res.json({
      success: true,
      message: '🗑️ Product deleted successfully',
    });
  } catch (err) {
    console.error('❌ Delete product error:', err);
    return res.status(500).json({ success: false, message: 'Delete failed' });
  }
};
