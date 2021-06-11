const User = require('../models/user');
const logger = require('../utils/logger');

async function getProfile(userId) {
   try {
      const user = await User.findById(userId);

      if (user.profile) {
         logger.info(
            'Fetched profile ' +
               JSON.stringify({ userId, profile: user.profile })
         );
         return user.profile;
      }

      throw new Error('Profile not found ' + JSON.stringify({ userId }));
   } catch (err) {
      logger.error('Profile not found ' + err);
      throw httpError(404, 'Profile not found');
   }
}

module.exports = { getProfile };
