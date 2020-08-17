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

const credentialsSecondary = {
   email: 'chawki@email.com',
   password: 'alsomypassword',
};

// user list of posts
const posts = [
   { content: 'Post 1' },
   { content: 'Post 2' },
   { content: 'Post 3' },
];

describe('POST /posts', () => {
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
   });
});

describe('GET /posts', () => {
   let userPrimary, userSecondary, userPrimaryPosts, userSecondaryPosts;

   beforeAll(async () => {
      // create user
      userPrimary = await User.create(credentials);
      await userPrimary.generateAuthToken();

      userSecondary = await User.create(credentialsSecondary);
      await userSecondary.generateAuthToken();

      userPrimaryPosts = posts.map((post) => ({
         owner: userPrimary._id,
         ...post,
      }));

      // create primary user list of posts
      await Post.insertMany(userPrimaryPosts);

      userSecondaryPosts = posts.map((post) => ({
         owner: userSecondary._id,
         ...post,
      }));

      // create secondary user list of posts
      await Post.insertMany(userSecondaryPosts);
   });

   it('Should get all posts', async () => {
      const res = await request(app)
         .get(baseUrl)
         .set('Authorization', `Bearer ${userPrimary.token}`)
         .expect(200);

      // expect to get posts
      expect(res.body).toEqual(
         expect.arrayContaining(userPrimaryPosts.concat(userSecondaryPosts))
      );
   });

   afterAll(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
   });
});

// get post by id
test('Should get post by id', async () => {
   const postId = userOne.posts[1]._id;

   // get second mock-up post
   await request(app)
      .get(`${baseUrl}/${postId}`)
      .set('Authorization', `Bearer ${userOne.token}`)
      .expect(200);
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
