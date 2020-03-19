const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');

beforeEach(async () => {
   // delete all users before testing
   await User.deleteMany({});
});

// test sign up route
test('Should sign up user successfuly', async () => {
   const user = await request(app)
      .post('/user/signup')
      .send({
         email: 'habib@test.com',
         password: 'thisismypass'
      })
      .expect(201);
});
