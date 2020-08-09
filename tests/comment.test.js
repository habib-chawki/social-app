const request = require('supertest');

const app = require('../src/app');
const Post = require('../models/post');

const { setup, teardown, userOnePosts, userTwoPosts } = require('./globals');
let userOne, userTwo;

const baseURL = '/comments';

beforeAll(async () => {
   [userOne, userTwo] = await setup();
});

// create new posts for userOne
test.each(userOnePosts)('Should create userOne posts', async (content) => {
   await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ content })
      .expect(201);
});

// create new posts for userTwo
test.each(userTwoPosts)('Should create userTwo posts', async (content) => {
   await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${userTwo.token}`)
      .send({ content })
      .expect(201);
});

test('Should add comment to appropriate post', async () => {
   // userOne comment on userTwo post
   const post = userTwoPosts[0];
   const content = `comment number 1 on ${post}`;
   const { _id: postId } = await Post.findOne({ content: post });

   const comment = await request(app)
      .post(`${baseURL}/?post=${postId}`)
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ content })
      .expect(201);
});

afterAll(teardown);
