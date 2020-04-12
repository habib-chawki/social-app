// mock-up users
const userOne = {
   email: 'habib@email.com',
   password: 'habibPass',
};

const userTwo = {
   email: 'chawki@email.com',
   password: 'chawkiPass',
};

// mock-up posts
const userOnePosts = ['post number 1 by userOne', 'post number 2 by userOne'];
const userTwoPosts = ['post number 3 by userTwo'];

// signup / login fail cases
const invalidCredentials = [
   { email: 'habib@email.com', password: '' },
   { email: '', password: 'thisisavalidpass' },
   { email: 'habibemail.com', password: 'thisisavalidpass' },
   { email: 'habib@email.com', password: 'th' },
];

const userOneUpdatedProfile = {
   firstName: 'Habib',
   lastName: 'Chawki',
   gender: 'male',
   bio: 'This is an updated bio',
   skills: {
      technical: [
         'Software engineering',
         'Network administration',
         'Machine learning',
      ],
   },
   languages: ['English', 'French', 'German', 'Spanish'],
};

module.exports = {
   userOne,
   userTwo,
   userOnePosts,
   userTwoPosts,
   invalidCredentials,
   userOneUpdatedProfile,
};
