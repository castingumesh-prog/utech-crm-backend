const request = require('supertest');
const app = require('../src/app');

describe('Quotation API', () => {
  test('quotation route requires auth', async () => {
    const response = await request(app)
      .post('/api/quotations')
      .send({
        customer_id: 1,
        lead_id: 1,
        total_amount: 15000
      });

    expect(response.statusCode).toBe(401);
  });
});
