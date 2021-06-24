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

   expect(User.create.mock.calls[0][0]).toEqual(userCredentials);
});

it('should delete user by id', async () => {
   // given the delete user function response
   const deletedCount = 1;
   User.deleteOne = jest.fn().mockReturnValue({ deletedCount });

   // when a request to delete the user by id is made
   const response = await userService.deleteUser(user._id);

   // then the user should be deleted successfully
   expect(response).toEqual(deletedCount);

   expect(User.deleteOne.mock.calls[0][0]).toEqual({ _id: user._id });
});

it('should log user out', async () => {
   // given the log out function response
   const nModified = 1;
   User.updateOne = jest.fn().mockReturnValue({ nModified });

   // when a request to log a user out by id
   const response = await userService.logUserOut(user._id);

   // then the user should be logged out successfully
   expect(response).toEqual(nModified);

   expect(User.updateOne.mock.calls[0][0]).toEqual({ _id: user._id });
   expect(User.updateOne.mock.calls[0][1]).toEqual({ token: null });
});
