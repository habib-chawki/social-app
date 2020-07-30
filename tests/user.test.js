const request = require('supertest');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const User = require('../models/user');

let { user, teardown, invalidCredentials } = require('./globals');

const baseURL = '/users';

// successful sign up
test('Should sign up user', async () => {
   const res = await request(app)
      .post(`${baseURL}/registration`)
      .send(user)
      .expect(201);

   // retrieve token and ensure its validity
   const token = JSON.parse(res.text).token;
   expect(validator.isJWT(token)).toBe(true);
});

// signup fail cases
test.each(invalidCredentials)('Should fail signup', async (credentials) => {
   await request(app)
      .post(`${baseURL}/registration`)
      .send(credentials)
      .expect(400);
});

// successful user login
test('Should log in user', async () => {
   const res = await request(app)
      .post(`${baseURL}/authentication`)
      .send(user)
      .expect(200);

   // retrieve token and verify its validity
   const { token } = JSON.parse(res.text);
   expect(validator.isJWT(token)).toBe(true);

   // decode token and retrieve user id
   const { id } = await jwt.verify(token, process.env.SECRET_KEY);

   // add id and token to mock-up user
   user = { ...user, token, id };
});

// login fail cases
test.each(invalidCredentials)('Should fail login', async (credentials) => {
   await request(app)
      .post(`${baseURL}/authentication`)
      .send(credentials)
      .expect(400);
});

// successful user logout
test('Should logout', async () => {
   await request(app)
      .post(`${baseURL}/logout`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

   // token should have been removed
   const newUser = await User.findById(user.id);
   expect(newUser.token).toBe('');
});

// password update
test('Should update password', async () => {
   await request(app)
      .patch(`${baseURL}/password`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ newPassword: 'newPassword' })
      .expect(200);

   // password should be updated
   const { password } = await User.findById(user.id);
   const match = await bcrypt.compare('newPassword', password);
   expect(match).toBe(true);
});

// delete user
test('Should remove user', async () => {
   await request(app)
      .delete(`${baseURL}/`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

   // user should be null
   const newUser = await User.findById(user.id);
   expect(newUser).toBeNull();
});

// cleanup
afterAll(teardown);
