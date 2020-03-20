const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');

const invalidCredentials = [
   { email: 'habib@gmail.com', password: '' },
   { email: '', password: 'thisisavalidpass' },
   { email: 'habibgmail.com', password: 'thisisavalidpass' },
   { email: 'habib@gmail.com', password: 'th' }
];

beforeEach(async () => {
   // delete all users before testing
   await User.deleteMany({});
});

// successful sign up
test('Should sign up user successfuly', async () => {
   await request(app)
      .post('/user/signup')
      .send({
         email: 'habib@test.com',
         password: 'thisismypass'
      })
      .expect(201);
});

// sign up fail
test.each(invalidCredentials)('Sign up should fail', async userCreds => {
   await request(app)
      .post('/user/signup')
      .send(userCreds)
      .expect(400);
});
