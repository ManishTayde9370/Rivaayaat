/*
Script: clean_wishlist.js
Purpose: Remove malformed wishlist entries (missing or invalid `product`) from users.
Usage: node scripts/clean_wishlist.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/model/Users');
const Product = require('../src/model/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Rivaayaat';

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for wishlist cleanup');

  try {
    const users = await User.find({ wishlist: { $exists: true, $ne: [] } }).lean();
    console.log(`Found ${users.length} users with wishlist entries`);

    let cleanedCount = 0;
    for (const u of users) {
      const originalLength = u.wishlist.length;

      const validWishlist = [];
      for (const item of u.wishlist) {
        if (!item) continue;
        const pid = item.product;
        if (!pid) continue;
        if (!mongoose.isValidObjectId(pid)) continue;
        const exists = await Product.exists({ _id: pid });
        if (exists) {
          validWishlist.push(item);
        }
      }

      if (validWishlist.length !== originalLength) {
        await User.updateOne({ _id: u._id }, { $set: { wishlist: validWishlist } });
        console.log(`Cleaned wishlist for user ${u._id}: ${originalLength} -> ${validWishlist.length}`);
        cleanedCount++;
      }
    }

    console.log(`Cleanup complete. Users modified: ${cleanedCount}`);
  } catch (err) {
    console.error('Error cleaning wishlist:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();
