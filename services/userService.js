const User = require('../models/user');
const bcrypt = require('bcrypt');

async function signUserUp(userCredentials) {
   try {
      const { email, password } = userCredentials;
      return await User.create({ email, password });
   } catch (err) {
      throw new Error('Signup failed');
   }
}

async function logUserIn(userCredentials) {
   const { email, password } = userCredentials;

   // find user by email
   const user = await User.findOne({ email });

   if (user) {
      if (password) {
         // check password validity
         const match = await bcrypt.compare(password, user.password);

         if (match) {
            // send back user
            return user;
         }

         // in case of invalid password
         throw new Error('Invalid password');
      }

      throw new Error('Password is required');
   }

   // last resort
   throw new Error('User does not exist');
}

module.exports = { signUserUp, logUserIn };
