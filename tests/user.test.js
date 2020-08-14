const request = require('supertest');
const validator = require('validator');
const bcrypt = require('bcrypt');

const app = require('../src/app');
const User = require('../models/user');

const baseURL = '/users';

const credentials = {
   email: 'habib@email.com',
   password: 'mypassword',
};

// signup / login fail cases
const invalidCredentials = [
   { email: 'habib@email.com', password: '' },
   { email: '', password: 'thisisavalidpass' },
   { email: 'habibemail.com', password: 'thisisavalidpass' },
   { email: 'habib@email.com', password: 'th' },
];

// test registration route (signup)
describe('POST /registration', () => {
   test('Should sign up user', async () => {
      const res = await request(app)
         .post(`${baseURL}/registration`)
         .send(credentials)
         .expect(201);

      // retrieve token and ensure its validity
      expect(validator.isJWT(res.body.token)).toBe(true);
   });

   test.each(invalidCredentials)('Should signup fail', async (credentials) => {
      const res = await request(app)
         .post(`${baseURL}/registration`)
         .send(credentials)
         .expect(400);

      // auth token should not be present
      expect(res.body.token).toBeUndefined();
   });

   afterEach(async () => {
      await User.deleteMany({});
   });
});

describe('Test with setup and teardown', () => {
   // create user before each test
   let user;
   beforeEach(async () => {
      user = await User.create({
         email: 'habib@email.com',
         password: 'mypassword',
      });

      await user.generateAuthToken();
   });

   // remove user document after each test
   afterEach(async () => {
      await User.deleteMany({});
   });

   // test authenticaion route (login)
   describe('POST /authentication', () => {
      // successful login
      test('Should log in user', async () => {
         const res = await request(app)
            .post(`${baseURL}/authentication`)
            .send(credentials)
            .expect(200);

         // retrieve token and verify its validity
         expect(validator.isJWT(res.body.token)).toBe(true);
      });

      // failed login cases
      test.each(invalidCredentials)(
         'Should login fail',
         async (credentials) => {
            await request(app)
               .post(`${baseURL}/authentication`)
               .send(credentials)
               .expect(400);
         }
      );

      afterEach(async () => {
         await User.deleteMany({});
      });
   });

   // test user logout route
   describe('POST /logout', () => {
      // successful user logout
      test('Should log out user', async () => {
         const res = await request(app)
            .post(`${baseURL}/logout`)
            .set('Authorization', `Bearer ${user.token}`)
            .expect(200);

         // token should have been removed
         expect(res.body.token).toBeNull();
      });
   });

   // test update password route
   describe('PATCH /password', () => {
      // successful password update
      test('Should update password', async () => {
         await request(app)
            .patch(`${baseURL}/password`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({ oldPassword: 'mypassword', newPassword: 'mynewpassword' })
            .expect(200);

         // password should have been updated
         const { password } = await User.findById(user._id);
         const match = await bcrypt.compare('mynewpassword', password);
         expect(match).toBe(true);
      });

      // failed password update in case of incorrect password
      test('Should not update password', async () => {
         await request(app)
            .patch(`${baseURL}/password`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({
               oldPassword: 'mypasswordincorrect',
               newPassword: 'mynewpassword',
            })
            .expect(500);

         // password should have stayed the same
         const { password } = await User.findById(user._id);
         const match = await bcrypt.compare('mypassword', password);
         expect(match).toBe(true);
      });
   });

   // test delete user route
   describe('DELETE /', () => {
      test('Should remove user', async () => {
         await request(app)
            .delete(`${baseURL}/`)
            .set('Authorization', `Bearer ${user.token}`)
            .expect(200);

         // user should be null
         const oldUser = await User.findById(user._id);
         expect(oldUser).toBeNull();
      });
   });
});
