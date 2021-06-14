const bcrypt = require('bcrypt');
const httpError = require('http-errors');

const User = require('../models/user');
const logger = require('../utils/logger');

async function signUserUp(userCredentials) {
   const { email, password } = userCredentials;
   try {
      const user = await User.create({ email, password });

      logger.info(
         'User signup success ' + JSON.stringify({ userId: user._id })
      );

      return user;
   } catch (err) {
      // extract email or password validation error message
      const errorMessage = err.errors['email']
         ? err.errors['email'].message
         : err.errors['password'].message;

      logger.error(
         'Signup failed ' + JSON.stringify({ errorMessage, email, password })
      );

      throw httpError(400, `Signup failed, ${errorMessage}`);
   }
}

async function logUserIn(userCredentials) {
   const { email, password } = userCredentials;

   const user = await User.findOne({ email });

   if (user) {
      // check password validity
      const match = await bcrypt.compare(password, user.password);

      if (match) {
         // send back user
         logger.info(
            'User login success ' + JSON.stringify({ userId: user._id })
         );
         return user;
      } else {
         logger.error(
            'Login failed ' +
               JSON.stringify({ errorMessage: 'Incorrect password', password })
         );

         throw httpError(400, 'Incorrect password');
      }
   } else {
      logger.error(
         'Could not find user by given email ' + JSON.stringify({ email })
      );
      throw httpError(400, 'Could not find user by given email');
   }
}

async function updatePassword(user, oldPassword, newPassword) {
   // check if password is correct
   const match = await bcrypt.compare(oldPassword, user.password);

   if (match) {
      // new password should not be the same as the old password
      if (oldPassword === newPassword) {
         logger.error(
            'Can not use the same password ' +
               JSON.stringify({ oldPassword, newPassword })
         );
         throw httpError(400, 'Can not use the same password');
      }

      // update password
      logger.info(
         'Password updated ' + JSON.stringify({ userId: user._id, newPassword })
      );

      await User.updateOne({ _id: user._id }, { password: newPassword });
   } else {
      logger.error(
         'Incorrect password ' + JSON.stringify({ password: oldPassword })
      );
      throw httpError(403, 'Incorrect password');
   }
}

async function deleteUser(userId) {
   try {
      const { deletedCount } = await User.deleteOne({
         _id: userId,
      });

      logger.info('User removed ' + JSON.stringify({ userId }));

      return deletedCount;
   } catch (err) {
      logger.error('Failed to delete user ' + JSON.stringify({ userId }));
      throw httpError(500, 'Failed to delete user');
   }
}

async function logUserOut(userId) {
   try {
      // remove auth token
      const { nModified } = await User.updateOne(
         { _id: userId },
         { token: null }
      );

      logger.info('User logged out ' + JSON.stringify({ userId }));

      return nModified;
   } catch (err) {
      logger.error('Logout failed ' + JSON.stringify({ userId }));
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
