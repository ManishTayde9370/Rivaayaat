const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/model/Users'); // adjust path if needed

const run = async () => {
  await mongoose.connect('mongodb://localhost:27017/rivaayat'); // adjust URI if needed

  const plainPassword = 'admin123';
  const hashed = await bcrypt.hash(plainPassword, 10);

  const result = await User.updateOne(
    { username: 'admin' },
    {
      $set: {
        password: hashed,
        isAdmin: true,
        isGoogleUser: false
      }
    }
  );

  console.log('✅ Admin updated:', result);
  process.exit();
};

run();
