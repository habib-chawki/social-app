const express = require('express');
const multer = require('multer');
const validator = require('validator');
const createError = require('http-errors');

const User = require('../models/user');
const auth = require('../middleware/auth');

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
      const response = await User.replaceOne(
         { _id: userId },
         { profile: req.body }
      );

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
router.post('/avatar', upload.single('avatar'), async (req, res) => {
   try {
      // retrieve user id
      const userId = req.params.userId;

      // retrieve user profile
      const { profile } = await User.findByIdAndUpdate(
         userId,
         { 'profile.avatar': req.file.buffer },
         { new: true }
      );

      if (profile) {
         return res.status(200).send('Avatar uploaded successfuly');
      }

      throw new Error('Unable to upload avatar.');
   } catch (e) {
      // 500 - internal Server Error
      res.status(500).send(e.message);
   }
});

module.exports = router;
