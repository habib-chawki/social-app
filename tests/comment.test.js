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
const userOnePosts = ['post number 1', 'post number 2', 'post number 3'];
const userTwoPosts = ['post number 4', 'post number 5'];

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
   // get post id
   const { _id: postId } = await Post.findOne({ content: userOnePosts[0] });

   await request(app)
      .post('/comment')
      .set('Authorization', userTwo.token)
      .send({ postId, comment: 'comment number 1' })
      .expect(201);
});

afterAll(async () => {
   await User.deleteMany({});
   await Post.deleteMany({});
});
