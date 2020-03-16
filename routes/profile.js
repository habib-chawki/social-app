const express = require('express');

const auth = require('../utils/auth');
const profileModel = require('../models/profile');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create profile
router.post('/', async (req, res) => {
   try {
      // create profile with current user's id
      const profile = await profileModel.create({
         owner: req.user._id,
         ...req.body
      });

      if (profile) {
         return res.status(201).send(`Profile created: ${profile}`);
      }

      throw new Error('Unable to create profile.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// get current user's profile
router.get('/', async (req, res) => {
   try {
      const profile = await profileModel.findOne({ owner: req.user._id });

      if (profile) {
         return res.status(200).send(`Profile found.`);
      }

      throw new Error('Unable to fetch profile.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// get user's profile by id
router.get('/:userId', async (req, res) => {
   try {
      const profile = await profileModel.findOne({ owner: req.params.userId });

      if (profile) {
         return res.status(200).send(`Profile found: ${profile}`);
      }

      throw new Error('Unable to fetch profile.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// update profile
router.put('/', async (req, res) => {
   try {
      const profile = await profileModel.replaceOne(
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
