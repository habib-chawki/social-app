const request = require('supertest');

const app = require('../src/app');
const Profile = require('../models/profile');

const { setup, teardown, userOneUpdatedProfile } = require('./globals');
let userOne, userTwo;

beforeAll(async () => {
   [userOne, userTwo] = await setup();
});

// get logged-in user profile
test('Should get profile', async () => {
   await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${userOne.token}`)
      .expect(200);
});

// get user profile by id
test('Should get profile by id', async () => {
   // get userTwo profile
   await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ userId: userTwo.id })
      .expect(200);
});

// upload avatar
test('Should upload avatar', async () => {
   await request(app)
      .post('/profile/avatar')
      .set('Authorization', `Bearer ${userOne.token}`)
      .attach('avatar', process.env.AVATAR)
      .expect(200);

   // file should have been saved as buffer
   const profile = await Profile.findOne({ owner: userOne.id });
   expect(profile.avatar).not.toBe(undefined);
});

// update user profile
test('Should update profile', async () => {
   await request(app)
      .put('/profile')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send(userOneUpdatedProfile)
      .expect(200);
});

// should delete profile when user is deleted
test('Should delete profile', async () => {
   await request(app)
      .delete('/user/remove')
      .set('Authorization', `Bearer ${userOne.token}`)
      .expect(200);

   // profile should be deleted when user is removed
   const profile = await Profile.findById(userOne.id);
   expect(profile).toBeNull();
});

afterAll(teardown);
