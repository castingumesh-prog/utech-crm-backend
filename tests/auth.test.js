const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  test('login requires email and password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(response.statusCode).toBe(400);
  });
});
