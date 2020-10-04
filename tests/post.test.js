const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');
const Post = require('../models/post');

const baseUrl = '/posts';

// user credentials
const credentials = {
   email: 'habib@email.com',
   password: 'mypassword',
};

describe('POST /posts', () => {
   // list of posts
   const posts = [
      { content: 'Post 1' },
      { content: 'Post 2' },
      { content: 'Post 3' },
   ];

   // create user
   let user;
   beforeAll(async () => {
      user = await User.create(credentials);
   });

   it.each(posts)('Should create post', async (post) => {
      await request(app)
         .post(baseUrl)
         .set('Authorization', user.token)
         .send({ content: post.content })
         .expect(201);
   });

   it('Should add posts', async () => {
      // retrieve list of posts with content only
      const userPosts = await Post.find(
         { owner: user._id },
         '-_id content'
      ).lean();

      // posts should have been added
      expect(userPosts).toEqual(expect.arrayContaining(posts));
   });

   afterAll(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
   });
});

describe('Test with setup and teardown', () => {
   let user, user2;

   // create a new user with a list of posts
   const createUser = async (credentials) => {
      const user = await User.create(credentials);

      await Post.insertMany([
         { owner: user._id, content: 'Post 1' },
         { owner: user._id, content: 'Post 2' },
         { owner: user._id, content: 'Post 3' },
      ]);

      return user;
   };

   beforeEach(async () => {
      // create primary user
      user = await createUser({
         email: 'habib@email.com',
         password: 'habibpass',
      });

      // create another user
      user2 = await createUser({
         email: 'chawki@email.com',
         password: 'chawkipass',
      });
   });

   afterEach(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
   });

   describe('GET /posts', () => {
      describe('GET /posts', () => {
         it('Should get list of all posts', async () => {
            const res = await request(app)
               .get(baseUrl)
               .set('Authorization', `Bearer ${user.token}`)
               .expect(200);

            // expect to get list of all posts
            const userPosts = await Post.find({});
            expect(JSON.stringify(res.body)).toEqual(JSON.stringify(userPosts));

            // expect list of posts to contain at least post 1
            expect(res.body).toEqual(
               expect.arrayContaining([
                  expect.objectContaining({ content: 'Post 1' }),
               ])
            );
         });

         it('Should get limited number of posts', async () => {
            // set limit for number of posts returned
            const limit = 2;

            const res = await request(app)
               .get(`${baseUrl}?limit=${limit}`)
               .set('Authorization', `Bearer ${user.token}`)
               .expect(200);

            // expect a list of "limit" posts
            expect(res.body.length).toBe(limit);
         });
      });

      describe('GET /posts/?user=userId', () => {
         it('Should get list of posts of a specific user', async () => {
            const posts = await Post.find({ owner: user._id });

            const res = await request(app)
               .get(`${baseUrl}/?user=${user._id}`)
               .set('Authorization', `Bearer ${user.token}`)
               .expect(200);

            expect(JSON.stringify(res.body)).toEqual(JSON.stringify(posts));
         });
      });

      describe('GET /posts/:id', () => {
         it('Should get a single post by id', async () => {
            // find post
            const post = await Post.findOne({ owner: user._id });

            const res = await request(app)
               .get(`${baseUrl}/${post._id}`)
               .set('Authorization', `Bearer ${user.token}`)
               .expect(200);

            expect(JSON.stringify(res.body)).toEqual(JSON.stringify(post));
         });
      });
   });

   describe('PUT /posts/:id', () => {
      it('Should update post by id', async () => {
         let post = await Post.findOne({
            owner: user._id,
            content: 'Post 1',
         });
         const updatedPostContent = 'Post 1 updated';

         const res = await request(app)
            .put(`${baseUrl}/${post._id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({ content: updatedPostContent })
            .expect(200);

         // post should have been updated
         post = await Post.findById(post._id);
         expect(post.content).toEqual(updatedPostContent);

         // should get the updated post back
         expect(res.body.content).toEqual(updatedPostContent);
      });

      it('Should not update other user post', async () => {
         let post = await Post.findOne({ owner: user._id, content: 'Post 1' });
         const updatedPostContent = 'Post 1 updated';

         const res = await request(app)
            .put(`${baseUrl}/${post._id}`)
            .set('Authorization', `Bearer ${user2.token}`)
            .send({ content: updatedPostContent })
            .expect(500);

         // post should not have been updated
         post = await Post.findById(post._id);
         expect(post.content).not.toEqual(updatedPostContent);
      });
   });

   describe('DELETE /posts/:id', () => {
      test('Should delete post by id', async () => {
         let post = await Post.findOne({
            owner: user._id,
            content: 'Post 2',
         });

         await request(app)
            .delete(`${baseUrl}/${post._id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .expect(200);

         // post should have been deleted
         post = await Post.findById(post._id);
         expect(post).toBeNull();
      });

      test('Should not delete other user post', async () => {
         let post = await Post.findOne({
            owner: user._id,
            content: 'Post 2',
         });

         await request(app)
            .delete(`${baseUrl}/${post._id}`)
            .set('Authorization', `Bearer ${user2.token}`)
            .expect(500);

         // post should still exist
         post = await Post.findById(post._id);
         expect(post).not.toBeNull();
      });
   });

   describe('DELETE /', () => {
      test('Should delete all posts of current user', async () => {
         let posts = await Post.find({ owner: user._id });

         const res = await request(app)
            .delete(baseUrl)
            .set('Authorization', `Bearer ${user.token}`)
            .expect(200);

         // number of deleted posts should equal the number of user posts
         expect(posts.length).toBe(res.body.deletedCount);

         // posts should have been deleted
         posts = await Post.find({ owner: user._id });
         expect(posts).toEqual([]);
      });
   });
});
