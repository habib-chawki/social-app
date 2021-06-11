const express = require('express');
const multer = require('multer');
const validator = require('validator');
const createError = require('http-errors');

const User = require('../models/user');
const auth = require('../middleware/auth');
const profileService = require('../services/profile-service');

// preserve the req.params values from the parent router (userRouter)
const router = express.Router({ mergeParams: true });

// require authentication for all incoming requests
router.use(auth);

// get user profile by user id
router.get('/', async (req, res, next) => {
   try {
      // retrieve user id from request url
      const userId = req.params.userId;

      // check user id validity
      if (!validator.isMongoId(userId)) {
         throw createError(400, 'Invalid id');
      }

      const user = await User.findById(userId);

      if (user) {
         return res.status(200).send(user.profile);
      }

      throw createError(404, 'Profile not found');
   } catch (err) {
      next(err);
   }
});

// update user profile
router.put('/', async (req, res, next) => {
   try {
      // retrieve user id
      const userId = req.params.userId;

      // check user id validity
      if (!validator.isMongoId(userId)) {
         throw createError(400, 'Invalid id');
      }

      // replace profile with updated version
      const response = await User.findByIdAndUpdate(userId, {
         $set: { profile: req.body },
      });

      // nModified: number of documents modified
      if (response.nModified === 1) {
         return res
            .status(200)
            .send({ message: 'Profile updated successfully' });
      }

      throw createError(500, 'Profile update failed');
   } catch (err) {
      next(err);
   }
});

// set up multer middleware for file upload
const upload = multer();

// upload an avatar
router.post('/avatar', upload.single('avatar'), async (req, res, next) => {
   try {
      // retrieve user id
      const userId = req.params.userId;

      // check user id validity
      if (!validator.isMongoId(userId)) {
         throw createError(400, 'Invalid id');
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

      throw createError(500, 'Avatar upload failed');
   } catch (err) {
      next(err);
   }
});

module.exports = router;
