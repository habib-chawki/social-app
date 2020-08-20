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
      await user.generateAuthToken();
   });

   it.each(posts)('Should create post', async (post) => {
      const res = await request(app)
         .post(baseUrl)
         .set('Authorization', user.token)
         .send({ content: post.content })
         .expect(201);
   });

   it('Should add posts', async () => {
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

describe('GET /posts', () => {
   let user;

   // create a new user with a list of posts
   const createUser = async (credentials) => {
      const user = await User.create(credentials);
      await user.generateAuthToken();

      await Post.insertMany([
         { owner: user._id, content: 'Post 1' },
         { owner: user._id, content: 'Post 2' },
      ]);

      return user;
   };

   beforeAll(async () => {
      // create primary user
      user = await createUser({
         email: 'habib@email.com',
         password: 'habibpass',
      });

      // create another user
      await createUser({
         email: 'chawki@email.com',
         password: 'chawkipass',
      });
   });

   describe('GET /', () => {
      it('Should get list of all posts', async () => {
         const res = await request(app)
            .get(baseUrl)
            .set('Authorization', `Bearer ${user.token}`)
            .expect(200);

         // expect to get list of all posts
         const userPosts = await Post.find({});
         expect(JSON.stringify(res.body)).toEqual(JSON.stringify(userPosts));

         // expect list of posts to contain at list post 1
         expect(res.body).toEqual(
            expect.arrayContaining([
               expect.objectContaining({ content: 'Post 1' }),
            ])
         );
      });
   });

   describe('GET /?:user', () => {
      it('Should get list of posts of a specific user', async () => {});
   });

   describe('GET /:id', () => {
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

   afterAll(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
   });
});

// update post by id
test('Should update post by id', async () => {
   // update post number 2
   const newPost = 'the new post number 2';
   const postId = userOne.posts[1]._id;

   await request(app)
      .put(`${baseUrl}/${postId}`)
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({ content: newPost })
      .expect(200);

   // post should have been updated
   const post = await Post.findById(postId);
   expect(post.content).toEqual(newPost);
});

// attempt to delete other users' posts
test('Should not delete other user post', async () => {
   // authenticate userTwo and try to delete userOne post
   const postId = userOne.posts[0]._id;

   await request(app)
      .delete(`${baseUrl}/${postId}`)
      .set('Authorization', `Bearer ${userTwo.token}`)
      .expect(404);
});

// delete post by id
test('Should delete post by id', async () => {
   const postId = userOne.posts[1]._id;

   await request(app)
      .delete(`${baseUrl}/${postId}`)
      .set('Authorization', `Bearer ${userOne.token}`)
      .expect(200);

   // post should have been deleted
   const post = await Post.findById(postId);
   expect(post).toBeNull();
});

// delete all posts
test('Should delete all posts', async () => {
   await request(app)
      .delete(baseUrl)
      .set('Authorization', `Bearer ${userOne.token}`)
      .expect(200);
});
