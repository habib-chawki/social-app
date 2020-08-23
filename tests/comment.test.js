const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

const baseUrl = '/comments';

describe('Test with setup and teardown', () => {
   let user, post;

   const comments = [
      { content: 'Comment 1' },
      { content: 'Comment 2' },
      { content: 'Comment 3' },
   ];

   beforeEach(async () => {
      // create a user
      user = await User.create({
         email: 'habib@email.com',
         password: 'mypassword',
      });
      await user.generateAuthToken();

      // create a post
      post = await Post.create({
         owner: user._id,
         content: 'My post',
      });
   });

   afterEach(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
   });

   describe('POST /comments', () => {
      it.each(comments)('Should create comment', async (comment) => {
         await request(app)
            .post(baseUrl)
            .set('Authorization', `Bearer ${user.token}`)
            .query({ post: post._id })
            .send({ owner: user._id, content: comment.content })
            .expect(201);
      });

      it('Should add comments', async () => {
         // retrieve list of comments with content only
         const postComments = await Comment.find(
            { post: post._id },
            '-_id content'
         ).lean();

         // comments should have been added
         expect(postComments).toEqual(expect.arrayContaning(comments));
      });
   });

   desctibe('GET /comments', () => {
      it('Should fetch list of comments', async () => {
         const res = await request(app)
            .get(baseUrl)
            .set('Authorization', `Bearer ${user.token}`)
            .query({ post: post._id })
            .expect(200);

         expect(res.body).toEqual(comments);
      });
   });
});
