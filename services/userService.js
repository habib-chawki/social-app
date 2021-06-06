const User = require('../models/user');
const bcrypt = require('bcrypt');
const httpError = require('http-errors');

async function signUserUp(userCredentials) {
   try {
      const { email, password } = userCredentials;
      return await User.create({ email, password });
   } catch (err) {
      throw httpError(400, 'Signup failed');
   }
}

async function logUserIn(userCredentials) {
   const { email, password } = userCredentials;
   let user;

   try {
      // find user by email
      user = await User.findOne({ email });
   } catch (err) {
      throw httpError(400, 'Could not find user by given email');
   }

   if (user) {
      if (password) {
         // check password validity
         const match = await bcrypt.compare(password, user.password);

         if (match) {
            // send back user
            return user;
         }

         // in case of invalid password
         throw httpError(400, 'Invalid password');
      }

      throw httpError(400, 'Password is required');
   }

   // last resort - user not found
   throw httpError(400, 'User not found');
}

async function updatePassword(user, oldPassword, newPassword) {
   // check if password is correct
   const match = await bcrypt.compare(oldPassword, user.password);

   if (match) {
      // new password should not be the same as the old password
      if (oldPassword === newPassword) {
         throw new Error('Can not use the same password');
      }

      // update password
      await User.updateOne({ _id: user._id }, { password: newPassword });
   }

   throw new Error('Incorrect password');
}

async function deleteUser(userId) {
   // remove user
   const { deletedCount } = await User.deleteOne({
      _id: userId,
   });

   if (deletedCount) return deletedCount;
   else throw new Error('Could not delete user with id: ' + userId);
}

module.exports = { signUserUp, logUserIn, updatePassword, deleteUser };
