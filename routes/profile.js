const express = require('express');
const multer = require('multer');
const validator = require('validator');
const httpError = require('http-errors');

const User = require('../models/user');
const auth = require('../middleware/auth');
const profileService = require('../services/profile-service');
const logger = require('../utils/logger');

// preserve the req.params values from the parent router (userRouter)
const router = express.Router({ mergeParams: true });

// require authentication for all incoming requests
router.use(auth);

// get user profile by user id
router.get('/', (req, res, next) => {
   // extract user id from request url
   const userId = req.params.userId;

   // check user id validity
   if (!validator.isMongoId(userId)) {
      logger.error('Invalid user id ' + JSON.stringify({ userId }));
      next(httpError(400, 'Invalid id'));
   }

   profileService
      .getProfile(userId)
      .then((profile) => res.status(200).send(profile))
      .catch((err) => next(err));
});

// update user profile
router.put('/', async (req, res, next) => {
   const userId = req.params.userId;
   const newProfile = req.body;

   // validate user id
   if (!validator.isMongoId(userId)) {
      logger.error('Invalid user id ' + JSON.stringify({ userId }));
      next(httpError(400, 'Invalid id'));
   }

   // validate new profile
   if (!newProfile) {
      logger.error(
         'New profile is required ' + JSON.stringify({ userId, newProfile })
      );
      next(httpError(400, 'New profile is required'));
   }

   profileService
      .updateProfile(userId, newProfile)
      .then(() =>
         res.status(200).send({ message: 'Profile updated successfully' })
      )
      .catch((err) => next(err));
});

// set up multer middleware for file upload
const upload = multer();

// upload an avatar
router.post('/avatar', upload.single('avatar'), async (req, res, next) => {
   try {
      // retrieve user id
      const userId = req.params.userId;

      // validate user id
      if (!validator.isMongoId(userId)) {
         logger.error('Invalid user id ' + JSON.stringify({ userId }));
         next(httpError(400, 'Invalid id'));
      }

      // retrieve user profile
      const user = await User.findByIdAndUpdate(
         userId,
         { 'profile.avatar': req.file.buffer },
         { new: true }
      );

      if (user.profile.avatar) {
         return res
            .status(200)
            .send({ message: 'Avatar uploaded successfuly' });
      }

      throw httpError(500, 'Avatar upload failed');
   } catch (err) {
      next(err);
   }
});

module.exports = router;
