const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');

// mock-up users
let userOne = {
   email: 'habib@email.com',
   password: 'habibPass',
};

let userTwo = {
   email: 'chawki@email.com',
   password: 'chawkiPass',
};

// mock-up profile
const userOneProfile = {
   firstName: 'Habib',
   lastName: 'Chawki',
   gender: 'male',
   bio: 'This is my bio',
   skills: {
      technical: ['Software engineering', 'Network administration'],
   },
   languages: ['English', 'French', 'German'],
};

const userOneUpdatedProfile = {
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

// create profile
test('Should create profile', async () => {
   await request(app)
      .post('/profile')
      .set('Authorization', userOne.token)
      .send(userOneProfile)
      .expect(201);
});

// get logged-in user profile
test('Should get profile', async () => {
   await request(app)
      .get('/profile')
      .set('Authorization', userOne.token)
      .expect(200);
});

// get user profile by id
test('Should get profile by id', async () => {
   // get userTwo profile
   await request(app)
      .get('/profile')
      .set('Authorization', userOne.token)
      .send({ userId: userTwo.id })
      .expect(200);
});

// update user profile
test('Should update profile', async () => {
   await request(app)
      .put('/profile')
      .set('Authorization', userOne.token)
      .send(userOneUpdatedProfile)
      .expect(200);
});
afterAll(async () => {
   await User.deleteMany({});
});
