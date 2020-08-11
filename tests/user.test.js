const request = require('supertest');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const User = require('../models/user');

let { user, teardown, invalidCredentials } = require('./globals');

const baseURL = '/users';

// test registration route (signup)
describe('POST /registration', () => {
   test('Should sign up user', async () => {
      const res = await request(app)
         .post(`${baseURL}/registration`)
         .send(user)
         .expect(201);

      // retrieve token and ensure its validity
      expect(validator.isJWT(res.body.token)).toBe(true);
   });

   test.each(invalidCredentials)(
      'Should not sign up user',
      async (credentials) => {
         const res = await request(app)
            .post(`${baseURL}/registration`)
            .send(credentials)
            .expect(400);

         // auth token should not be present
         expect(res.body.token).toBeUndefined();
      }
   );
});

// test authenticaion route (login)
describe('POST /authentication', () => {
   test('Should login user', async () => {
      const res = await request(app)
         .post(`${baseURL}/authentication`)
         .send(user)
         .expect(200);

      // retrieve token and verify its validity
      expect(validator.isJWT(res.body.token)).toBe(true);
   });

   test.each(invalidCredentials)(
      'Should not login user',
      async (credentials) => {
         await request(app)
            .post(`${baseURL}/authentication`)
            .send(credentials)
            .expect(400);
      }
   );
});

// test logout route
describe('POST /logout', () => {
   const user;
   beforeEach(async () => {
      // create new user
      user = await User.create({});
   });

   // successful user logout
   test('Should logout', async () => {
      const res = await request(app)
         .post(`${baseURL}/logout`)
         .set('Authorization', `Bearer ${user.token}`)
         .expect(200);

      // token should have been removed
      expect(res.body.token).toBeNull();
   });

   afterEach(async () => {
      await User.deleteMany({});
   });
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
