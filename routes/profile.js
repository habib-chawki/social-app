const express = require('express');

const auth = require('../utils/auth');
const Profile = require('../models/profile');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create profile
router.post('/', async (req, res) => {
   try {
      // create profile with current user's id
      const profile = await Profile.create({
         owner: req.user._id,
         ...req.body,
      });

      if (profile) {
         return res.status(201).send(`Profile created: ${profile}`);
      }

      throw new Error('Unable to create profile.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// get user's profile by id (userId is optional)
router.get('/', async (req, res) => {
   try {
      // check if userId is provided (get profile by id or get current logged-in user's profile)
      const userId = req.body.userId ? req.body.userId : req.user._id;
      const profile = await Profile.findOne({ owner: userId });

      if (profile) {
         return res.status(200).send(JSON.stringify(profile));
      }

      throw new Error('Unable to fetch profile.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// update profile
router.put('/', async (req, res) => {
   try {
      const profile = await Profile.replaceOne(
         { owner: req.user._id },
         { owner: req.user._id, ...req.body }
      );

      if (profile) {
         return res.status(200).send(`Profile updated.`);
      }

      throw new Error('Unable to update profile.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

module.exports = router;
