const request = require('supertest');
const app = require('../src/app');

describe('Work Order API', () => {
  test('work order route requires auth', async () => {
    const response = await request(app)
      .post('/api/work-orders')
      .send({
        quotation_id: 1,
        customer_id: 1,
        total_amount: 15000
      });

    expect(response.statusCode).toBe(401);
  });
});
