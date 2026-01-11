const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock admin middleware to bypass auth in tests
jest.mock('../src/middleware/authMiddleware', () => ({
  requireAdmin: (req, res, next) => { req.user = { _id: 'test' }; return next(); }
}));

let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Mount routes
  app = express();
  app.use(express.json());
  const adminCsv = require('../src/routes/adminCsvRoutes');
  app.use('/api/admin/csv', adminCsv);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('CSV preview endpoint', () => {
  it('should preview rows and report validation errors', async () => {
    const mapping = { name: 'name', price: 'price', stock: 'stock' };
    const csv = 'name,price,stock\nGood,12.5,10\nBad,notANum,5\n';

    const res = await request(app)
      .post('/api/admin/csv/preview')
      .field('mapping', JSON.stringify(mapping))
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.preview)).toBe(true);
    // Expect one error (price not a number)
    const errs = res.body.errors || [];
    expect(errs.length).toBe(1);
    expect(errs[0].errors[0].code).toBe('invalid_price');
    expect(errs[0].errors[0].message).toMatch(/price must be a number/);
  });
});
