const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');

// user credentials for testing
const user = {
   email: 'chawki@email.com',
   password: 'p@ssw0rd'
};

// set up all possible sign up fail cases
const invalidCredentials = [
   { email: 'habib@email.com', password: '' },
   { email: '', password: 'thisisavalidpass' },
   { email: 'habibemail.com', password: 'thisisavalidpass' },
   { email: 'habib@email.com', password: 'th' }
];

beforeEach(async () => {
   // delete all users before testing
   await User.deleteMany({});
   // add a user
   await User.create(user);
});

// successful sign up
test('Should sign up user successfuly', async () => {
   await request(app)
      .post('/user/signup')
      .send({
         email: 'habib@email.com',
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
