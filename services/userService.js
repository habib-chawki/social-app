const bcrypt = require('bcrypt');
const httpError = require('http-errors');

const User = require('../models/user');
const logger = require('../utils/logger');

async function signUserUp(userCredentials) {
   try {
      const { email, password } = userCredentials;
      const user = await User.create({ email, password });

      logger.info('User signup ' + JSON.stringify({ userId: user._id }));

      return user;
   } catch (err) {
      logger.error(
         'Signup failed ' +
            JSON.stringify({ error: err.errors['email' || 'password'].message })
      );
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
      logger.error(
         'Could not find user by given email ' + JSON.stringify({ email })
      );
      throw httpError(404, 'Could not find user by given email');
   }

   // check password validity
   const match = await bcrypt.compare(password, user.password);

   if (match) {
      // send back user
      logger.info('User login ' + JSON.stringify({ userId: user._id }));
      return user;
   } else {
      logger.error('Invalid password ' + JSON.stringify({ password }));
      throw httpError(400, 'Invalid password');
   }
}

async function updatePassword(user, oldPassword, newPassword) {
   // check if password is correct
   const match = await bcrypt.compare(oldPassword, user.password);

   if (match) {
      // new password should not be the same as the old password
      if (oldPassword === newPassword) {
         throw httpError(400, 'Can not use the same password');
      }

      // update password
      await User.updateOne({ _id: user._id }, { password: newPassword });
   } else {
      throw httpError(403, 'Incorrect password');
   }
}

async function deleteUser(userId) {
   try {
      const { deletedCount } = await User.deleteOne({
         _id: userId,
      });

      return deletedCount;
   } catch (err) {
      throw httpError(500, 'Failed to delete user');
   }
}

async function logUserOut() {
   try {
      // remove auth token
      const { nModified } = await User.updateOne(
         { _id: req.user._id },
         { token: null }
      );

      return nModified;
   } catch (err) {
      throw httpError(500, 'Logout failed');
   }
}

module.exports = {
   signUserUp,
   logUserIn,
   updatePassword,
   deleteUser,
   logUserOut,
};
