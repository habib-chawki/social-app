const User = require('../models/user');

async function createUser(userCredentials) {
   try {
      const { email, password } = userCredentials;
      return await User.create({ email, password });
   } catch (err) {
      throw new Error('Signup failed');
   }
}

module.exports = { createUser };
