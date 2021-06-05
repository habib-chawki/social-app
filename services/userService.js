const User = require('../models/user');

async function createUser(userCredentials) {
   const { email, password } = userCredentials;
   return await User.create({ email, password });
}

module.exports = { createUser };
