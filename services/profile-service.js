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

async function updateProfile(userId, newProfile) {
   try {
      // replace profile with updated version
      const response = await User.findByIdAndUpdate(userId, {
         $set: { profile: newProfile },
      });

      // nModified: number of documents modified
      if (response.nModified === 1) {
         logger.info(
            'Profile updated ' + JSON.stringify({ userId, newProfile })
         );
         return newProfile;
      }

      throw new Error(
         'Profile update failed ' + JSON.stringify({ userId, newProfile })
      );
   } catch (err) {
      logger.error('Profile update failed ' + err);
      throw httpError(404, 'Profile update failed');
   }
}

async function uploadAvatar(userId, avatar) {
   try {
      // retrieve user profile
      const user = await User.findByIdAndUpdate(
         userId,
         { 'profile.avatar': avatar },
         { new: true }
      );

      if (user.profile.avatar) {
         logger.info('Avatar uploaded ' + JSON.stringify({ userId }));
         return user.profile.avatar;
      }

      throw new Error('Avatar upload failed ' + JSON.stringify({ userId }));
   } catch (err) {
      logger.error('Avatar upload failed ' + err);
      throw httpError(404, 'Avatar upload failed');
   }
}

module.exports = { getProfile, updateProfile, updateProfile, uploadAvatar };
