const userService = require('../../services/user-service.js');
const User = require('../../models/user.js');

const user = {
   email: 'user@email.me',
   password: 'user@password.me',
};

it('should sign user up', async () => {
   User.create = jest.fn().mockReturnValue(user);

   const response = await userService.signUserUp({ ...user });

   expect(response).toEqual(user);
});
