const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../src/app');

const User = require('../models/user');
const Post = require('../models/post');

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

// global setup
async function setup() {
   // setup mock-up users
   return [
      await setupMockUser({
         email: 'habib@email.com',
         password: 'habibPass',
      }),
      await setupMockUser({
         email: 'chawki@email.com',
         password: 'chawkiPass',
      }),
   ];
}

// update mock-user with token and id
async function setupMockUser(user) {
   // signup user
   const response = await request(app)
      .post('/users/registration')
      .send(user)
      .expect(201);

   // retrieve and decode auth token
   const token = JSON.parse(response.text).token;
   const id = await jwt.verify(token, process.env.SECRET_KEY).id;

   return { ...user, token, id };
}

// global teardown
async function teardown() {
   await User.deleteMany({});
   await Post.deleteMany({});
}

module.exports = {
   setup,
   teardown,
   user,
   userOnePosts,
   userTwoPosts,
   invalidCredentials,
   userOneUpdatedProfile,
};
