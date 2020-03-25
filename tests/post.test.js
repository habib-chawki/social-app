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
test('Should create post', async () => {
   const res = await request(app)
      .post('/post')
      .set('Authorization', userOne.token)
      .send({ content: 'userOne post' })
      .expect(201);

   // expect new post to have been added
   const { posts } = JSON.parse(res.text);
   expect(posts.length).toBeGreaterThan(0);
});

afterAll(async () => await User.deleteMany({}));
