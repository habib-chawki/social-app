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
         return res.status(201).send(`Profile created ${profile}`);
      }

      throw new Error('Unable to create profile.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// get profile
router.get('/', (req, res) => {});

// update profile
router.post('/', (req, res) => {});

module.exports = router;
