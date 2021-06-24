const userService = require('../../services/user-service.js');
const User = require('../../models/user.js');

const user = {
   _id: '507f1f77bcf86cd799439030',
   email: 'user@email.me',
   password: 'user@password.me',
};

it('should sign user up', async () => {
   // given the create user function
   User.create = jest.fn().mockReturnValue(user);

   // given the user credetials
   const { _id, ...userCredentials } = user;

   // when a request to create a new user is made
   const response = await userService.signUserUp(userCredentials);

   // then expect the user to have been created successfully
   expect(response).toEqual(user);
});

it('should log user out', async () => {
   // given the log out function response
   User.updateOne = jest.fn().mockReturnValue({ nModified: 1 });

   // when a request to log a user out by id
   const response = await userService.logUserOut(user._id);

   // then the user should be logged out successfully
   expect(response).toEqual(1);
});
