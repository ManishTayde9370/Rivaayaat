const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock admin middleware to bypass auth in tests
jest.mock('../src/middleware/authMiddleware', () => ({
  requireAdmin: (req, res, next) => { req.user = { _id: 'test' }; return next(); }
}));

// Mock node-cron to avoid scheduling during tests
jest.mock('node-cron', () => ({ schedule: jest.fn(() => ({ stop: jest.fn() })) }));


let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Mount routes
  app = express();
  app.use(express.json());
  const adminExports = require('../src/routes/adminExportRoutes');
  app.use('/api/admin/exports', adminExports);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const ScheduledExport = require('../src/model/ScheduledExport');
const ScheduledExportRun = require('../src/model/ScheduledExportRun');

describe('Scheduled export runs', () => {
  it('should create a run when triggered and list it', async () => {
    const s = new ScheduledExport({ name: 'Test Export', cron: '0 0 * * *', destination: 'email', emails: ['test@example.com'] });
    await s.save();

    const triggerRes = await request(app).post(`/api/admin/exports/trigger/${s._id}`);
    expect(triggerRes.status).toBe(200);
    expect(triggerRes.body.success).toBe(true);

    // allow some time for async run to create run doc
    await new Promise(r => setTimeout(r, 100));

    const listRes = await request(app).get(`/api/admin/exports/${s._id}/runs`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.runs)).toBe(true);
    expect(listRes.body.total).toBeGreaterThanOrEqual(1);
  });

  it('should allow retrying a failed run', async () => {
    const s = new ScheduledExport({ name: 'Retry Export', cron: '0 0 * * *', destination: 'email', emails: ['a@b.com'], retry: { enabled: true, maxAttempts: 3, backoffSeconds: 1 } });
    await s.save();

    const failed = new ScheduledExportRun({ schedule: s._id, status: 'failed', attempt: 1, errorMessage: 'simulated' });
    await failed.save();

    const retryRes = await request(app).post(`/api/admin/exports/runs/${failed._id}/retry`);
    expect(retryRes.status).toBe(200);
    expect(retryRes.body.success).toBe(true);

    // allow time for retry job to be scheduled/run
    await new Promise(r => setTimeout(r, 200));

    const runs = await ScheduledExportRun.find({ schedule: s._id }).sort({ createdAt: -1 }).lean();
    // there should be at least two runs now (failed + retry attempt)
    expect(runs.length).toBeGreaterThanOrEqual(2);
    expect(runs[0].attempt).toBeGreaterThanOrEqual(2);
  });
});
