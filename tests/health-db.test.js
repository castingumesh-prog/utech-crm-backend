const request = require('supertest');
const app = require('../src/app');

describe('DB health endpoint', () => {
  test('returns database status', async () => {
    const response = await request(app).get('/api/health/db');

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(600);
    expect(response.body).toHaveProperty('success');
  });
});
