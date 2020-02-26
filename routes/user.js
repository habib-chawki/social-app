const express = require('express');
const bcrypt = require('bcrypt');

const userModel = require('../models/user');
const auth = require('../utils/authentication');

const router = express.Router();

// get user profile
router.get('/profile', auth, (req, res) => {
   res.status(200).send(req.body.user);
});

// user signup
router.post('/signup', async (req, res) => {
   const { name, email, password } = req.body;
   const salt = 8;

   try {
      // create the new user with a hashed password
      const user = await userModel.create({
         name,
         email,
         password: await bcrypt.hash(password, salt)
      });

      // generate an auth token when the user is created successfuly
      user.generateAuthToken();

      res.status(201).send(`User created successfuly.`);
   } catch (e) {
      res.status(400).send(`Error: could not create user: ${e.message}`);
   }
});

// user login
router.post('/login', async (req, res) => {
   const { email, password } = req.body;
   try {
      // find user by email
      const user = await userModel.findOne({ email });
      if (user) {
         // check password validity
         const same = await bcrypt.compare(password, user.password);
         if (same) {
            user.generateAuthToken();
            return res.status(200).send(`User logged-in successfuly: ${user}`);
         }
      }
      // reject login in case of incorrect email or password
      throw new Error(`Unable to login. Incorrect email or password`);
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// user logout
router.post('/logout', async (req, res) => {
   try {
      // log user out by _id
      await userModel.updateOne({ _id: req.body.id }, { token: '' });
      res.status(200).send('Logged out successfuly.');
   } catch (e) {
      res.status(400).send('Error: ' + e.message);
   }
});

module.exports = router;
