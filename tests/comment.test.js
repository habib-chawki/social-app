const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

const baseUrl = '/comments';

describe('Test with a single user', () => {
   let user, post;

   const comments = [
      { content: 'Comment 1' },
      { content: 'Comment 2' },
      { content: 'Comment 3' },
   ];

   beforeAll(async () => {
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

   afterAll(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
      await Comment.deleteMany({});
   });

   describe('POST /comments', () => {
      it.each(comments)('Should create comment', async (comment) => {
         const res = await request(app)
            .post(`${baseUrl}?post=${post._id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({ content: comment.content })
            .expect(201);
      });
   });

   describe('GET /comments', () => {
      it('Should fetch list of comments', async () => {
         const res = await request(app)
            .get(`${baseUrl}?post=${post._id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .expect(200);

         // should get back the list of comments
         const comments = await Comment.find({ post: post._id });
         expect(JSON.stringify(res.body)).toEqual(JSON.stringify(comments));
      });
   });
});

describe('Test with multiple users', () => {
   let user, post, comment;
   let user2, post2, comment2;

   const createUser = async (credentials) => {
      const user = await User.create(credentials);
      await user.generateAuthToken();

      // create a post
      const post = await Post.create({ owner: user._id, content: 'My post' });

      // return the user and their post
      return [user, post];
   };

   beforeEach(async () => {
      // create primary user
      [user, post] = await createUser({
         email: 'habib@email.com',
         password: 'habibpass',
      });

      // create another user
      [user2, post2] = await createUser({
         email: 'chawki@email.com',
         password: 'chawkipass',
      });

      // create comments
      comment = await Comment.create({
         owner: user._id,
         post: post2._id,
         content: 'User 1 comment on User 2 post',
      });

      comment2 = await Comment.create({
         owner: user2._id,
         post: post._id,
         content: 'User 2 comment on User 1 post',
      });
   });

   afterEach(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
      await Comment.deleteMany({});
   });

   describe('PUT comments/:id?post=postId', () => {
      it('Should update comment by id', async () => {
         // updated comment content
         const content = 'updated: User 1 comment on User 2 post';

         const res = await request(app)
            .put(`${baseUrl}/${comment._id}?post=${post2._id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({ content })
            .expect(200);

         expect(res.body.content).toEqual(content);
      });

      it('Should not update other user comment', async () => {
         // user 2 should not be able to update user 1 comment
         const res = await request(app)
            .put(`${baseUrl}/${comment._id}?post=${post2._id}`)
            .set('Authorization', `Bearer ${user2.token}`)
            .send({ content: 'updated !' })
            .expect(400);

         expect(res.body.content).not.toEqual('updated !');
      });
   });

   describe('DELETE comments/:id?post=postId', () => {
      it('Should delete comment by id', async () => {
         const res = await request(app)
            .delete(`${baseUrl}/${comment._id}?post=${post2._id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .expect(200);

         // the appropriate comment should have been deleted
         expect(res.body._id).toEqual(comment._id.toString());

         // comment should have been deleted
         const userComment = await Comment.findById(comment._id);
         expect(userComment).toBeNull();
      });

      it('Should not delete other user comment', async () => {
         await request(app)
            .delete(`${baseUrl}/${comment2._id}?post=${post._id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .expect(400);

         // comment should not have been deleted
         const user2Comment = await Comment.findById(comment2._id);
         expect(user2Comment.content).toEqual(comment2.content);
      });
   });
});
