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
test.each(mockPosts)('Should create post', async content => {
   await request(app)
      .post('/post')
      .set('Authorization', userOne.token)
      .send({ content })
      .expect(201);
});

test('Should add posts', async () => {
   const user = await User.findById(userOne.id);
   const posts = await Post.find({});

   // expect new posts to have been added
   expect(user.posts.length).toBe(mockPosts.length);
   expect(posts.length).toBe(mockPosts.length);

   // add posts to mock-up user
   userOne.posts = user.posts;
});

// should get back all posts
test('Should get all posts', async () => {
   const res = await request(app)
      .get('/post/all')
      .set('Authorization', userOne.token)
      .expect(200);

   // expect to get all userOne posts
   expect(JSON.parse(res.text).length).toBe(userOne.posts.length);
});

// should get post by id
test('Should get post by id', async () => {
   // get second mock-up post
   const res = await request(app)
      .get(`/post/${userOne.posts[1]}`)
      .set('Authorization', userOne.token)
      .expect(200);

   // should get the correct post back
   const post = await Post.findById(userOne.posts[1]);
   expect(res.text).toEqual(post.content);
});

afterAll(async () => {
   // delete all users and posts
   await User.deleteMany({});
   await Post.deleteMany({});
});
