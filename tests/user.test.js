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

   afterEach(async () => {
      await User.deleteMany({});
   });
});

describe('Test with setup and teardown', () => {
   // create user
   let user;
   beforeEach(async () => {
      user = await User.create({
         email: 'habib@email.com',
         password: 'mypassword',
      });

      await user.generateAuthToken();
   });

   afterEach(async () => {
      await User.deleteMany({});
   });

   // test authenticaion route (login)
   describe('POST /authentication', () => {
      test('Should login user', async () => {
         const res = await request(app)
            .post(`${baseURL}/authentication`)
            .send(credentials)
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

      afterEach(async () => {
         await User.deleteMany({});
      });
   });

   // test logout route
   describe('POST /logout', () => {
      // successful user logout
      test('Should logout', async () => {
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

   describe('DELETE /', () => {
      // delete user
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
