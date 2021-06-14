const express = require('express');
const multer = require('multer');
const isMongoId = require('validator/lib/isMongoId');
const httpError = require('http-errors');

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
   if (!isMongoId(userId.toString())) {
      logger.error('Invalid user id ' + JSON.stringify({ userId }));
      next(httpError(400, 'Invalid id'));
   }

   profileService
      .getProfile(userId)
      .then((profile) => res.status(200).send(profile))
      .catch((err) => next(err));
});

// update user profile
router.put('/', (req, res, next) => {
   const userId = req.params.userId;
   const newProfile = req.body;

   // validate user id
   if (!isMongoId(userId)) {
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
router.post('/avatar', upload.single('avatar'), (req, res, next) => {
   // extract user id and avatar
   const userId = req.params.userId;
   const avatar = req.file.buffer;

   // validate user id
   if (!isMongoId(userId)) {
      logger.error('Invalid user id ' + JSON.stringify({ userId }));
      next(httpError(400, 'Invalid id'));
   }

   profileService
      .uploadAvatar(userId, avatar)
      .then(() =>
         res.status(200).send({ message: 'Avatar uploaded successfuly' })
      )
      .catch((err) => next(err));
});

module.exports = router;
