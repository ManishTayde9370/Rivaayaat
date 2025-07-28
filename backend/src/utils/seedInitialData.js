const mongoose = require('mongoose');
require('dotenv').config();

const Blog = require('../model/Blog');
const Store = require('../model/Store');
const FAQ = require('../model/FAQ');
const FAQQuestion = require('../model/FAQQuestion');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pep';

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Blog
  await Blog.deleteMany({});
  await Blog.insertMany([
    { title: 'The Art of Handloom Sarees', date: '2024-06-01', excerpt: 'Discover the beauty of handloom sarees...', content: 'Full article about handloom sarees.' },
    { title: 'Terracotta: Earth’s Timeless Craft', date: '2024-06-02', excerpt: 'Terracotta in Indian decor...', content: 'Full article about terracotta.' }
  ]);
  console.log('Seeded Blog');

  // Store
  await Store.deleteMany({});
  await Store.insertMany([
    { name: 'Rivaayat Flagship Store', address: '123 Heritage Lane, Jaipur' },
    { name: 'Rivaayat Mumbai', address: '456 Tradition St, Mumbai' }
  ]);
  console.log('Seeded Store');

  // FAQ
  await FAQ.deleteMany({});
  await FAQ.insertMany([
    { q: 'How do I track my order?', a: 'Use the Track Order page and enter your order ID and email.' },
    { q: 'What is your return policy?', a: 'Returns accepted within 15 days of delivery.' }
  ]);
  console.log('Seeded FAQ');

  // FAQQuestion
  await FAQQuestion.deleteMany({});
  await FAQQuestion.insertMany([
    { question: 'Do you ship internationally?' },
    { question: 'Are your products handmade?' }
  ]);
  console.log('Seeded FAQQuestion');

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(err => { console.error(err); process.exit(1); }); 