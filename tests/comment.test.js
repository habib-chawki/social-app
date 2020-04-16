const request = require('supertest');

const app = require('../src/app');
const Post = require('../models/post');
const User = require('../models/user');
const Profile = require('../models/profile');

const { setup, userOnePosts, userTwoPosts } = require('./globals');
let userOne, userTwo;

beforeAll(async () => {
   [userOne, userTwo] = await setup();
});

// create new posts for userOne
test.each(userOnePosts)('Should create userOne posts', async (content) => {
   await request(app)
      .post('/post')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ content })
      .expect(201);
});

// create new posts for userTwo
test.each(userTwoPosts)('Should create userTwo posts', async (content) => {
   await request(app)
      .post('/post')
      .set('Authorization', `Bearer ${userTwo.token}`)
      .send({ content })
      .expect(201);
});

test('Should add comment to appropriate post', async () => {
   // userOne comment on userTwo post
   const post = userTwoPosts[0];
   const comment = `comment number 1 on ${post}`;
   const { _id: postId } = await Post.findOne({ content: post });

   await request(app)
      .post('/comment')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ postId, comment })
      .expect(201);
});

// edit comment by id
test('Should edit comment', async () => {
   // userOne edit comment on userTwo post
   // find appropriate post
   const post = await Post.findOne({ content: userTwoPosts[0] });

   const newComment = 'new edited comment number 1';
   const { _id: postId } = post;
   const commentId = post.comments[0]._id;

   await request(app)
      .put('/comment')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ postId, commentId, newComment })
      .expect(200);

   // userTwo should not be able to edit userOne comment
   await request(app)
      .put('/comment')
      .set('Authorization', `Bearer ${userTwo.token}`)
      .send({ postId, commentId, newComment })
      .expect(400);
});

// delete comment by id
test('Should delete comment', async () => {
   const post = await Post.findOne({ content: userTwoPosts[0] });

   // grab post and comment id
   const { _id: postId } = post;
   const commentId = post.comments[0]._id;

   await request(app)
      .delete('/comment')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ postId, commentId })
      .expect(200);

   // userTwo should not be able to delete userOne comment
   await request(app)
      .delete('/comment')
      .set('Authorization', `Bearer ${userTwo.token}`)
      .send({ postId, commentId })
      .expect(400);
});

afterAll(async () => {
   await User.deleteMany({});
   await Profile.deleteMany({});
   await Post.deleteMany({});
});
