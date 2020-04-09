const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');
const Profile = require('../models/profile');

// mock-up users
let userOne = {
   email: 'habib@email.com',
   password: 'habibPass',
};

let userTwo = {
   email: 'chawki@email.com',
   password: 'chawkiPass',
};

const userOneUpdatedProfile = {
   firstName: 'Habib',
   lastName: 'Chawki',
   gender: 'male',
   bio: 'This is an updated bio',
   skills: {
      technical: [
         'Software engineering',
         'Network administration',
         'Machine learning',
      ],
   },
   languages: ['English', 'French', 'German', 'Spanish'],
};

beforeAll(async () => {
   // create first user
   const resOne = await request(app)
      .post('/user/signup')
      .send(userOne)
      .expect(201);

   // create second user
   const resTwo = await request(app)
      .post('/user/signup')
      .send(userTwo)
      .expect(201);

   // populate token and id fields
   userOne = { ...userOne, ...JSON.parse(resOne.text) };
   userTwo = { ...userTwo, ...JSON.parse(resTwo.text) };
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

afterAll(async () => {
   await User.deleteMany({});
   await Profile.deleteMany({});
});
