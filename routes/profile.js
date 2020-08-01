const express = require('express');
const multer = require('multer');

const User = require('../models/user');
const auth = require('../utils/auth');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// get user profile by id
router.get('/', async (req, res) => {
   try {
      // retrieve user id from request url
      const userId = req.params.id;
      const { profile } = await User.findById(userId);

      if (profile) {
         return res.status(200).send(JSON.stringify(profile));
      }

      throw new Error('Unable to fetch user profile.');
   } catch (e) {
      // 500 - Internal Server Error
      res.status(500).send(e.message);
   }
});

// update user profile
router.put('/', async (req, res) => {
   try {
      // retrieve user id
      const userId = req.params.id;

      // replace profile with updated version
      const response = await User.replaceOne(
         { _id: userId },
         { profile: req.body }
      );

      // nModified: number of documents modified
      if (response.nModified === 1) {
         return res.status(200).send(response);
      }

      throw new Error('Unable to update profile.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// setup multer middleware for file upload
const upload = multer();

// upload an avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
   try {
      // retrieve user profile
      const user = await User.findOne({ _id: req.params.id });

      // save avatar to database
      user.profile.avatar = req.file.buffer;
      await user.save();

      res.status(200).send('Avatar uploaded.');
   } catch (e) {
      // 500 - internal Server Error
      res.status(500).send(e.message);
   }
});

module.exports = router;
