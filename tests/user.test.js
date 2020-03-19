const request = require('supertest');
const app = require('../src/app');

test('Should sign up user and return token', async () => {
   await request(app)
      .post('/user/signup')
      .send({
         email: 'habib2@test.com',
         password: 'thisismypass'
      })
      .expect(201);
});
