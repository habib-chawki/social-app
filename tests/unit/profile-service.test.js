const profileService = require('../../services/profile-service');
const User = require('../../models/user');

const profile = {
   firstName: 'First',
   middleName: 'Middle',
   lastName: 'Last',

   address: 'number, street, city',
   gender: 'female',
   bio: 'Bio goes here',

   experience: [],
   education: [],
   skills: {
      technical: [
         'Software development',
         'Network administration',
         'Machine learning',
      ],
   },
   languages: ['English', 'French', 'German'],
};

const user = {
   _id: '507f1f77bcf86cd799439010',
   email: 'first.last@email.she',
   password: 'first_last_pass',
   profile,
};

it('should get user profile', async () => {
   // given the user found by id
   User.findById = jest.fn().mockReturnValue(user);

   const response = await profileService.getProfile(user._id);

   expect(response).toEqual(user.profile);
});
