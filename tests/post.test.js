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

// posts should have been added
test('Should add posts', async () => {
   const user = await User.findById(userOne.id);
   const posts = await Post.find({});

   // expect new posts to have been added to posts collection and user's posts list
   expect(user.posts.length).toBe(mockPosts.length);
   expect(posts.length).toBe(mockPosts.length);

   // add posts to mock-up user
   userOne.posts = user.posts;
});

// get back all posts
test('Should get all posts', async () => {
   const res = await request(app)
      .get('/post/all')
      .set('Authorization', userOne.token)
      .expect(200);

   // expect to get all userOne posts
   expect(JSON.parse(res.text).length).toBe(userOne.posts.length);
});

// get post by id
test('Should get post by id', async () => {
   const postId = userOne.posts[1];

   // get second mock-up post
   const res = await request(app)
      .get(`/post/${postId}`)
      .set('Authorization', userOne.token)
      .expect(200);

   // should get the correct post back
   const post = await Post.findById(postId);
   expect(res.text).toEqual(post.content);
});

// update post by id
test('Should update post by id', async () => {
   // update post number 2
   const newPost = 'the new post number 2';
   const postId = userOne.posts[1];

   await request(app)
      .patch(`/post/${postId}`)
      .set('Authorization', userOne.token)
      .send({ content: newPost })
      .expect(200);

   // post should have been updated
   const post = await Post.findById(postId);
   expect(post.content).toEqual(newPost);
});

// attempt to delete other users' posts
test('Should not delete other user post', async () => {
   // authenticate userTwo and try to delete userOne post
   const postId = userOne.posts[0];

   await request(app)
      .delete(`/post/${postId}`)
      .set('Authorization', userTwo.token)
      .expect(404);
});

// delete post by id
test('Should delete post by id', async () => {
   const postId = userOne.posts[1];

   await request(app)
      .delete(`/post/${postId}`)
      .set('Authorization', userOne.token)
      .expect(200);

   // post should have been deleted
   const post = await Post.findById(postId);
   expect(post).toBeNull();
});

// delete all posts
test('Should delete all posts', async () => {
   await request(app)
      .delete('/post/all')
      .set('Authorization', userOne.token)
      .expect(200);

   // all posts should have been deleted
   const user = await User.findById(userOne.id, 'posts');
   expect(user.posts.length).toEqual(0);
});

afterAll(async () => {
   // delete all users and posts
   await User.deleteMany({});
   await Post.deleteMany({});
});
