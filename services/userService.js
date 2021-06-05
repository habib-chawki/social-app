const User = require('../models/user');

async function signUserUp(userCredentials) {
   try {
      const { email, password } = userCredentials;
      return await User.create({ email, password });
   } catch (err) {
      throw new Error('Signup failed');
   }
}

async function logUserIn() {}

module.exports = { signUserUp, logUserIn };
