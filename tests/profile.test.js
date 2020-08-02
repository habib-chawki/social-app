const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');

const { setup, teardown, userOneUpdatedProfile } = require('./globals');
let userOne, userTwo;

beforeAll(async () => {
   [userOne, userTwo] = await setup();
});

// get logged-in user profile
test('Should get profile', async () => {
   await request(app)
      .get(`/users/${userOne.id}/profile`)
      .set('Authorization', `Bearer ${userOne.token}`)
      .expect(200);
});

// upload avatar
test('Should upload avatar', async () => {
   await request(app)
      .post(`/users/${userOne.id}/profile/avatar`)
      .set('Authorization', `Bearer ${userOne.token}`)
      .attach('avatar', process.env.AVATAR)
      .expect(200);

   // file should have been saved as buffer
   const { profile } = await User.findById(userOne.id);
   expect(profile.avatar).not.toBe(undefined);
});

// update user profile
test('Should update profile', async () => {
   await request(app)
      .put(`/users/${userOne.id}/profile`)
      .set('Authorization', `Bearer ${userOne.token}`)
      .send(userOneUpdatedProfile)
      .expect(200);
});

afterAll(teardown);
