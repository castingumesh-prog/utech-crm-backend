const request = require('supertest');
const app = require('../src/app');

describe('Lead API', () => {
  test('create lead without auth is rejected', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({
        lead_code: 'UTL001',
        name: 'ABC Industries',
        mobile: '9876543210'
      });

    expect(response.statusCode).toBe(401);
  });
});
