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

beforeAll(async () => {
   userOne = await User.create(userOne);
   userTwo = await User.create(userTwo);
});

test('Should get token', () => {
   expect(userOne.token).not.toBeNull();
});

afterAll(async () => {
   await User.deleteMany({});
   await Post.deleteMany({});
});
