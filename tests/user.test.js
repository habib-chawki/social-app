const request = require('supertest');
const validator = require('validator');

const app = require('../src/app');
const User = require('../models/user');

// clean up database
afterAll(async () => {
   // delete all users before testing
   await User.deleteMany({});
});

// user credentials for testing
const userOne = {
   email: 'habib@email.com',
   password: 'p@ssw0rd'
};

// successful sign up
test('Should sign up user successfuly', async () => {
   const res = await request(app)
      .post('/user/signup')
      .send(userOne)
      .expect(201);

   // retrieve token and ensure its validity
   const token = JSON.parse(res.text).token;
   expect(validator.isJWT(token)).toBe(true);
});

// set up all possible sign up fail cases
const invalidCredentials = [
   { email: 'habib@email.com', password: '' },
   { email: '', password: 'thisisavalidpass' },
   { email: 'habibemail.com', password: 'thisisavalidpass' },
   { email: 'habib@email.com', password: 'th' }
];

// sign up fail
test.each(invalidCredentials)('Sign up should fail', async userCreds => {
   await request(app)
      .post('/user/signup')
      .send(userCreds)
      .expect(400);
});

// user login
test('Should log in user successfuly', async () => {
   const res = await request(app)
      .post('/user/login')
      .send(userOne)
      .expect(200);

   // retrieve token and ensure its validity
   const token = JSON.parse(res.text).token;
   expect(validator.isJWT(token)).toBe(true);

   // add token to mock-up user
   userOne['token'] = token;
});

// login fail cases
test.each(invalidCredentials)('Login should fail', async userCreds => {
   await request(app)
      .post('/user/login')
      .send(userCreds)
      .expect(400);
});
