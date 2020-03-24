const request = require('supertest');
const validator = require('validator');
const bcrypt = require('bcrypt');

const app = require('../src/app');
const User = require('../models/user');

// mock-up user
const userOne = {
   email: 'habib@email.com',
   password: 'p@ssw0rd'
};

// signup / login fail cases
const invalidCredentials = [
   { email: 'habib@email.com', password: '' },
   { email: '', password: 'thisisavalidpass' },
   { email: 'habibemail.com', password: 'thisisavalidpass' },
   { email: 'habib@email.com', password: 'th' }
];

// successful sign up
test('Should sign up user', async () => {
   const res = await request(app)
      .post('/user/signup')
      .send(userOne)
      .expect(201);

   // retrieve token and ensure its validity
   const token = JSON.parse(res.text).token;
   expect(validator.isJWT(token)).toBe(true);
});

// signup fail cases
test.each(invalidCredentials)('Should fail signup', async credentials => {
   await request(app)
      .post('/user/signup')
      .send(credentials)
      .expect(400);
});

// successful user login
test('Should log in user', async () => {
   const res = await request(app)
      .post('/user/login')
      .send(userOne)
      .expect(200);

   // retrieve token and ensure its validity
   const { token, id } = JSON.parse(res.text);
   expect(validator.isJWT(token)).toBe(true);

   // add id and token to mock-up user
   userOne['token'] = token;
   userOne['id'] = id;
});

// login fail cases
test.each(invalidCredentials)('Should fail login', async credentials => {
   await request(app)
      .post('/user/login')
      .send(credentials)
      .expect(400);
});

// successful user logout
test('Should logout', async () => {
   await request(app)
      .post('/user/logout')
      .set('Authorization', `Bearer ${userOne.token}`)
      .expect(200);

   // token should have been removed
   const user = await User.findById(userOne.id);
   expect(user.token).toBe('');
});

// password update
test('Should update password', async () => {
   const res = await request(app)
      .patch('/user/update')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ newPassword: 'newPassword' })
      .expect(200);

   // password should be updated
   const same = await bcrypt.compare('newPassword', res.text);
   expect(same).toBe(true);
});

// delete user
test('Should remove user', async () => {
   await request(app)
      .delete('/user/remove/')
      .set('Authorization', `Bearer ${userOne.token}`)
      .expect(200);

   // user should be null
   const user = await User.findById(userOne.id);
   expect(user).toBeNull();
});

// cleanup
afterAll(async () => {
   await User.deleteMany({});
});
