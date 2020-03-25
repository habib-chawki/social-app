const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');
const Post = require('../models/post');

// mock-up users
let userOne = {
   email: 'habib@email.com',
   password: 'habibPass'
};

let userTwo = {
   email: 'chawki@email.com',
   password: 'chawkiPass'
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

// create new post
test('Should create post', () => {
   console.log(userOne, userTwo);
});

afterAll(async () => await User.deleteMany({}));
