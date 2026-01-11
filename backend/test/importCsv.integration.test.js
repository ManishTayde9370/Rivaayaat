const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../src/middleware/authMiddleware', () => ({
  requireAdmin: (req, res, next) => { req.user = { _id: 'test' }; return next(); }
}));

let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  app = express();
  app.use(express.json());

  const adminProducts = require('../src/routes/adminProductRoutes');
  app.use('/api/admin/products', adminProducts);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Import CSV integration', () => {
  it('imports valid rows and skips invalid ones', async () => {
    const mapping = { 'Product Name': 'name', 'Price USD': 'price', 'Stock': 'stock' };
    const csv = 'Product Name,Price USD,Stock\nGood Product,12.3,10\nBad Price,notanumber,5\n,15,5';

    const res = await request(app)
      .post('/api/admin/products/import-csv')
      .field('mapping', JSON.stringify(mapping))
      .attach('file', Buffer.from(csv), 'import.csv');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.created + res.body.updated).toBe(1); // only 1 valid created
    expect(Array.isArray(res.body.errors)).toBe(true);
    // Should report the bad price row with invalid_price
    const badPrice = res.body.errors.find(e => e.line && e.errors && e.errors.some(err => err.code === 'invalid_price'));
    expect(badPrice).toBeTruthy();
  });
});
