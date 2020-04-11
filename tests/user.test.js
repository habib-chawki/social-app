const request = require('supertest');
const validator = require('validator');
const bcrypt = require('bcrypt');

const app = require('../src/app');
const User = require('../models/user');
const Profile = require('../models/profile');

let { userOne, invalidCredentials } = require('./globals');

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
test.each(invalidCredentials)('Should fail signup', async (credentials) => {
   await request(app).post('/user/signup').send(credentials).expect(400);
});

// successful user login
test('Should log in user', async () => {
   const res = await request(app).post('/user/login').send(userOne).expect(200);

   // retrieve token and ensure its validity
   const { token, id } = JSON.parse(res.text);
   expect(validator.isJWT(token)).toBe(true);

   // add id and token to mock-up user
   userOne = { ...userOne, token, id };
});

// login fail cases
test.each(invalidCredentials)('Should fail login', async (credentials) => {
   await request(app).post('/user/login').send(credentials).expect(400);
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
   await request(app)
      .patch('/user/update')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ newPassword: 'newPassword' })
      .expect(200);

   // password should be updated
   const { password } = await User.findById(userOne.id);
   const match = await bcrypt.compare('newPassword', password);
   expect(match).toBe(true);
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
   await Profile.deleteMany({});
});
