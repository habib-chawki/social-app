const request = require('supertest');

const app = require('../src/app');
const Post = require('../models/post');
const User = require('../models/user');

const { setup, teardown, userOnePosts, userTwoPosts } = require('./globals');
let userOne, userTwo;

const baseUrl = '/comments';

describe('POST /comments', () => {
   let user, post;

   const comments = [
      { content: 'Comment 1' },
      { content: 'Comment 2' },
      { content: 'Comment 3' },
   ];

   beforeEach(async () => {
      user = await User.create({
         email: 'habib@email.com',
         password: 'mypassword',
      });
      await user.generateAuthToken();

      post = await Post.create({
         owner: user._id,
         content: 'My post',
      });
   });

   afterEach(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
   });

   it.each(comments)('Should create comment', async (comment) => {
      await request(app)
         .post(baseUrl)
         .set('Authorization', `Bearer ${user.token}`)
         .send({
            owner: user._id,
            post: post._id,
            content: comment.content,
         })
         .expect(201);
   });
});

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
      .post(`${baseUrl}/?post=${postId}`)
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ content })
      .expect(201);
});

afterAll(teardown);
