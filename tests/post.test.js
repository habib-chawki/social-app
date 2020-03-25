const request = require('supertest');

const app = require('../src/app');
const User = require('../models/user');
const Post = require('../models/post');

// mock-up users
let users = [];

beforeAll(async () => {
   // create first user
   await request(app)
      .post('/user/signup')
      .send({
         email: 'habib@email.com',
         password: 'habibPass'
      })
      .expect(200);

   // create second user
   await request(app)
      .post('/user/signup')
      .send({
         email: 'chawki@email.com',
         password: 'chawkiPass'
      })
      .expect(200);

   // get both users
   users = await User.find({
      email: {
         $in: ['habib@email.com', 'chawki@gmail.com']
      }
   });
});

afterAll(async () => await User.deleteMany({}));
