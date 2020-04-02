const request = require('supertest');

const app = require('../src/app');
const Post = require('../models/post');
const User = require('../models/user');

//mock-up user
let userOne = {
   email: 'habib@email.com',
   password: 'habibPass'
};

let userTwo = {
   email: 'chawki@email.com',
   password: 'chawkiPass'
};

// mock-up posts
const userOnePosts = ['post number 1', 'post number 2'];
const userTwoPosts = ['post number 3'];

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
test.each(userOnePosts)('Should create userOne posts', async content => {
   await request(app)
      .post('/post')
      .set('Authorization', userOne.token)
      .send({ content })
      .expect(201);
});

// create new posts for userTwo
test.each(userTwoPosts)('Should create userTwo posts', async content => {
   await request(app)
      .post('/post')
      .set('Authorization', userTwo.token)
      .send({ content })
      .expect(201);
});

test('Should add comment to appropriate post', async () => {
   // setup comment and get post id
   const comment = `comment number 1 on ${userOnePosts[0]}`;
   const { _id: postId } = await Post.findOne({ content: userTwoPosts[0] });

   // userOne comments on userTwo's post
   await request(app)
      .post('/comment')
      .set('Authorization', userOne.token)
      .send({ postId, comment })
      .expect(201);
});

test('Should edit comment', async () => {
   // find appropriate post
   const post = await Post.findOne({ content: userTwoPosts[0] });

   const newComment = 'new edited comment number 1';
   const { _id: postId } = post;
   const commentId = post.comments[0]._id;

   await request(app)
      .put('/comment')
      .set('Authorization', userOne.token)
      .send({ postId, commentId, newComment })
      .expect(200);
});

afterAll(async () => {
   await User.deleteMany({});
   await Post.deleteMany({});
});
