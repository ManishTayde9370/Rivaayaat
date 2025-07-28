const mongoose = require('mongoose');
const Product = require('../model/Product');

// Sample categories for Rivaayat (traditional Indian products)
const categories = [
  'Handcrafted Apparel',
  'Traditional Jewelry', 
  'Home Decor',
  'Artisanal Textiles',
  'Wellness & Ayurveda',
  'Heritage Food',
  'Festive Items',
  'Kids & Culture'
];

// Sample category mapping for existing products
const categoryMapping = {
  'saree': 'Artisanal Textiles',
  'kurta': 'Handcrafted Apparel',
  'jewelry': 'Traditional Jewelry',
  'lamp': 'Home Decor',
  'diya': 'Home Decor',
  'wood': 'Home Decor',
  'textile': 'Artisanal Textiles',
  'apparel': 'Handcrafted Apparel',
  'decor': 'Home Decor',
  'wellness': 'Wellness & Ayurveda',
  'ayurveda': 'Wellness & Ayurveda',
  'food': 'Heritage Food',
  'festive': 'Festive Items',
  'kids': 'Kids & Culture'
};

const addCategoriesToProducts = async () => {
  try {
    console.log('🔄 Starting category assignment...');
    
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rivaayat';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      let category = null;

      // Try to determine category from product name and description
      const searchText = `${product.name} ${product.description || ''}`.toLowerCase();

      // Check for specific keywords
      for (const [keyword, cat] of Object.entries(categoryMapping)) {
        if (searchText.includes(keyword)) {
          category = cat;
          break;
        }
      }

      // If no category found, assign a random one
      if (!category) {
        category = categories[Math.floor(Math.random() * categories.length)];
      }

      // Update product with category
      if (product.category !== category) {
        product.category = category;
        await product.save();
        updatedCount++;
        console.log(`✅ Updated "${product.name}" with category: ${category}`);
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} products with categories`);
    
    // Show category statistics
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📊 Category Distribution:');
    categoryStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} products`);
    });

  } catch (error) {
    console.error('❌ Error adding categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script if called directly
if (require.main === module) {
  addCategoriesToProducts()
    .then(() => {
      console.log('✅ Category assignment completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = addCategoriesToProducts; 