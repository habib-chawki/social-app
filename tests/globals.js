const request = require('supertest');
const app = require('../src/app');

// mock-up user
let user = {
   email: 'habib@email.com',
   password: 'habibPass',
};

// mock-up posts
const userOnePosts = ['post number 1 by userOne', 'post number 2 by userOne'];
const userTwoPosts = ['post number 3 by userTwo'];

// signup / login fail cases
const invalidCredentials = [
   { email: 'habib@email.com', password: '' },
   { email: '', password: 'thisisavalidpass' },
   { email: 'habibemail.com', password: 'thisisavalidpass' },
   { email: 'habib@email.com', password: 'th' },
];

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

// global setup and teardown
async function setup() {
   // mock-up users
   let userOne = {
      email: 'habib@email.com',
      password: 'habibPass',
   };

   let userTwo = {
      email: 'chawki@email.com',
      password: 'chawkiPass',
   };

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

   return [userOne, userTwo];
}

async function teardown() {}

module.exports = {
   setup,
   user,
   userOnePosts,
   userTwoPosts,
   invalidCredentials,
   userOneUpdatedProfile,
};
