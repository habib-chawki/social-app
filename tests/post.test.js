const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');
const Post = require('../models/post');

// mock-up users
let userOne = {
   email: 'habib@email.com',
   password: 'habibPass',
   posts: []
};

let userTwo = {
   email: 'chawki@email.com',
   password: 'chawkiPass',
   posts: []
};

// mock-up posts
const mockPosts = ['post number 1', 'post number 2', 'post number 3'];

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

// create new posts for userOne
describe('Create posts', () => {
   test.each(mockPosts)('Should create post', async content => {
      await request(app)
         .post('/post')
         .set('Authorization', userOne.token)
         .send({ content })
         .expect(201);
   });

   afterAll(async () => {
      // expect new posts to have been added
      const user = await User.findById(userOne.id);
      console.log(user.posts);
      expect(user.posts.length).toBe(mockPosts.length);
   });
});

afterAll(async () => await User.deleteMany({}));
