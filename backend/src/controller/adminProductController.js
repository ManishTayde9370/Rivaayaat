const Product = require('../model/Product');
const { cloudinary } = require('../utils/cloudinary'); // 👈 Make sure this is setup
const StockNotification = require('../model/StockNotification');
const sendStockNotificationEmail = require('../utils/sendStockNotificationEmail');
const LowStockAlert = require('../model/LowStockAlert');

// ➕ Add Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, artisan, artisanName } = req.body;

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
      artisan: artisan || undefined, // ObjectId reference
      artisanName: artisanName || '', // fallback for legacy
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: '✅ Product created successfully',
      product: newProduct,
    });
  } catch (err) {
    console.error('❌ Product creation error:', err);
    return res.status(500).json({ success: false, message: 'Error creating product', error: err.message });
  }
};

// 📄 Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('artisan').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error('❌ Fetch products error:', err);
    return res.status(500).json({ success: false, message: 'Error fetching products', error: err.message });
  }
};

// 🔁 Export products as CSV (admin)
exports.exportProductsCSV = async (req, res) => {
  try {
    const products = await Product.find().lean();
    const headers = ["_id","name","description","price","stock","category","artisanName","averageRating","numReviews","images"];

    const escape = (val) => {
      if (val === undefined || val === null) return '';
      const s = String(val);
      // Escape double quotes by doubling them
      return '"' + s.replace(/"/g, '""') + '"';
    };

    const rows = products.map(p => {
      return [
        escape(p._id),
        escape(p.name),
        escape(p.description),
        escape(p.price),
        escape(p.stock),
        escape(p.category),
        escape(p.artisanName || ''),
        escape(p.averageRating || 0),
        escape(p.numReviews || 0),
        escape((p.images || []).join('|'))
      ].join(',');
    });

    const csv = headers.join(',') + "\n" + rows.join('\n');

    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv);
  } catch (err) {
    console.error('❌ Export CSV error:', err);
    return res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};

// 🔁 Import products from CSV (admin) - accepts multipart/form-data (file)
exports.importProductsCSV = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }

    const content = req.file.buffer.toString('utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return res.status(400).json({ success: false, message: 'CSV seems empty' });

    const header = lines[0].split(',').map(h => h.replace(/\"/g, '').trim());
    const created = [];
    const updated = [];
    const errors = [];

    const { parseLine, validateProductData } = require('../utils/csvUtils');

    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : null;

    for (let i = 1; i < lines.length; i++) {
      try {
        const cols = parseLine(lines[i]);
        const obj = {};
        header.forEach((h, idx) => { obj[h] = cols[idx] !== undefined ? cols[idx].replace(/(^\")|("$)/g, '') : ''; });

        // Map using provided mapping if present, else use header names
        const data = {
          name: mapping ? (obj[Object.keys(mapping).find(k=>mapping[k]==='name')] || '') : (obj.name || obj.Name || ''),
          description: mapping ? (obj[Object.keys(mapping).find(k=>mapping[k]==='description')] || '') : (obj.description || obj.Description || ''),
          price: mapping ? (obj[Object.keys(mapping).find(k=>mapping[k]==='price')] || '') : (obj.price || ''),
          stock: mapping ? (obj[Object.keys(mapping).find(k=>mapping[k]==='stock')] || '') : (obj.stock || ''),
          category: mapping ? (obj[Object.keys(mapping).find(k=>mapping[k]==='category')] || '') : (obj.category || obj.Category || ''),
          artisanName: mapping ? (obj[Object.keys(mapping).find(k=>mapping[k]==='artisanName')] || '') : (obj.artisanName || obj.ArtisanName || ''),
          images: mapping ? (obj[Object.keys(mapping).find(k=>mapping[k]==='images')] || '') : (obj.images || '')
        };

        // Clean images into array
        data.images = data.images ? String(data.images).split('|').filter(Boolean) : [];

        // Validate row
        const validation = validateProductData(data);
        if (validation.length) {
          errors.push({ line: i+1, errors: validation });
          continue; // skip invalid row
        }

        // Cast numeric fields
        if (data.price !== undefined && data.price !== '') data.price = Number(data.price);
        if (data.stock !== undefined && data.stock !== '') data.stock = Number(data.stock);

        // Update existing by _id or name
        let product = null;
        if (obj._id) product = await Product.findById(obj._id);
        if (!product && data.name) product = await Product.findOne({ name: data.name });

        if (product) {
          Object.assign(product, data);
          await product.save();
          updated.push(product._id);
        } else {
          const newP = new Product(data);
          await newP.save();
          created.push(newP._id);
        }
      } catch (err) {
        errors.push({ line: i+1, error: err.message });
      }
    }

    return res.json({ success: true, created: created.length, updated: updated.length, errors });
  } catch (err) {
    console.error('❌ Import CSV error:', err);
    return res.status(500).json({ success: false, message: 'Failed to import CSV' });
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
            const folder = 'Rivaayat_products'; // Your folder name
            const public_id = `${folder}/${publicIdWithExt}`;

            await cloudinary.uploader.destroy(public_id);
          } catch (err) {
            console.warn(`⚠️ Failed to delete image from Cloudinary: ${imgUrl}`, err);
          }
        }
      }

      updateData.images = req.files.map((file) => file.path);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // If product was previously out of stock and now has stock, notify subscribers
    try {
      const prevStock = product.stock || 0;
      const newStock = updated.stock || 0;
      if (prevStock <= 0 && newStock > 0) {
        const subs = await StockNotification.find({ product: product._id, notified: false }).populate('user');
        if (subs && subs.length > 0) {
          await Promise.all(subs.map(async (sub) => {
            const toEmail = sub.email || (sub.user && sub.user.email);
            if (!toEmail) return;
            try {
              await sendStockNotificationEmail(toEmail, updated);
              sub.notified = true;
              await sub.save();
            } catch (err) {
              console.error('❌ Failed to notify subscriber', toEmail, err.message);
            }
          }));
        }
      }
    } catch (err) {
      console.error('❌ Error sending stock notifications:', err);
    }

    // Low-stock alert: create or remove alert depending on threshold
    try {
      const threshold = updated.lowStockThreshold || 5;
      const newStock = updated.stock || 0;
      if (newStock <= threshold) {
        await LowStockAlert.findOneAndUpdate(
          { product: updated._id },
          { product: updated._id, currentStock: newStock, threshold, acknowledged: false },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } else {
        // clear existing alerts if stock is sufficient
        await LowStockAlert.deleteMany({ product: updated._id });
      }
    } catch (err) {
      console.error('❌ Low-stock alert error:', err);
    }

    return res.json({
      success: true,
      message: '✅ Product updated successfully',
      product: updated,
    });
  } catch (err) {
    console.error('❌ Update product error:', err);
    return res.status(500).json({ success: false, message: 'Update failed', error: err.message });
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
          const folder = 'Rivaayat_products';
          const public_id = `${folder}/${publicIdWithExt}`;

          await cloudinary.uploader.destroy(public_id);
        } catch (err) {
          console.warn(`⚠️ Failed to delete image from Cloudinary: ${imgUrl}`, err);
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
    return res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
  }
};
