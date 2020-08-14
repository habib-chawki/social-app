const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');

const { userOneUpdatedProfile } = require('./globals');

const credentials = {
   email: 'habib@email.com',
   password: 'mypassword',
};

let user;

// create user
beforeAll(async () => {
   user = await User.create(credentials);
   await user.generateAuthToken();
});

test('Should get user profile', async () => {
   const res = await request(app)
      .get(`/users/${user._id}/profile`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

   const profile = res.body;
   expect(Object.keys(profile)).toEqual(
      expect.arrayContaining([
         '_id',
         'firstName',
         'bio',
         'experience',
         'createdAt',
      ])
   );
});

// upload avatar
test('Should upload avatar', async () => {
   await request(app)
      .post(`/users/${user._id}/profile/avatar`)
      .set('Authorization', `Bearer ${user.token}`)
      .attach('avatar', process.env.AVATAR)
      .expect(200);

   // file should have been saved as buffer
   const { profile } = await User.findById(user._id);
   expect(profile.avatar).not.toBe(undefined);
});

// update user profile
test('Should update profile', async () => {
   await request(app)
      .put(`/users/${user._id}/profile`)
      .set('Authorization', `Bearer ${user.token}`)
      .send(userOneUpdatedProfile)
      .expect(200);
});

// remove user document
afterAll(async () => {
   await User.deleteMany({});
});
