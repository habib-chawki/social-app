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
   const response = await userService.signUserUp({ userCredentials });

   // then expect the user to have been created successfully
   expect(response).toEqual(user);
});
