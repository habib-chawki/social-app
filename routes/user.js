const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Profile = require('../models/profile');

const auth = require('../utils/auth');

const router = express.Router();

// user signup
router.post('/signup', async (req, res) => {
   try {
      // create the new user (req.body == email and password)
      const user = await User.create(req.body);
      if (user) {
         // create user profile
         await Profile.create({ owner: user._id });

         // generate an auth token when the user is created successfuly
         await user.generateAuthToken();

         // 201 - created
         // send back generated auth token
         return res.status(201).send({ token: user.token });
      }

      throw new Error('Unable to create user.');
   } catch (e) {
      // 400 - bad request
      res.status(400).send(e.message);
   }
});

// user login
router.post('/login', async (req, res) => {
   const { email, password } = req.body;

   try {
      // find user by email
      const user = await User.findOne({ email });
      if (user) {
         // check password validity
         const match = await bcrypt.compare(password, user.password);
         if (match) {
            // send back generated token
            await user.generateAuthToken();
            return res.status(200).send({ token: user.token });
         }
      }

      // reject login in case of incorrect email or password
      throw new Error('Unable to login. Incorrect email or password.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// update user password
router.patch('/update', auth, async (req, res) => {
   try {
      // find user by id and patch the password (after hashing)
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 8);
      const user = await User.findByIdAndUpdate(req.user._id, {
         password: hashedPassword,
      });

      if (user) {
         return res.status(200).send(hashedPassword);
      }

      throw new Error('Unable to update password.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// user logout
router.post('/logout', auth, async (req, res) => {
   try {
      // log user out by id (delete auth token)
      await User.updateOne({ _id: req.user._id }, { token: '' });
      res.status(200).send('Logged out successfuly.');
   } catch (e) {
      // 500 - internal Server Error
      res.status(500).send(e.message);
   }
});

// delete user
router.delete('/remove', auth, async (req, res) => {
   try {
      // remove user
      const user = await User.findByIdAndDelete(req.user._id);

      // send 200 status code if both user and profile were successfuly deleted
      if (user) {
         // remove user profile
         await Profile.deleteOne({ owner: user._id });
         return res.status(200).send(user);
      }

      throw new Error('Unable to delete user.');
   } catch (e) {
      // 500 - internal Server Error
      res.status(500).send(e.message);
   }
});

module.exports = router;
