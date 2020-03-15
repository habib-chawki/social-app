const express = require('express');
const bcrypt = require('bcrypt');

const userModel = require('../models/user');
const auth = require('../utils/auth');

const router = express.Router();

// get user profile
router.get('/me', auth, (req, res) => {
   res.status(200).send(req.user);
});

// user signup
router.post('/signup', async (req, res) => {
   const { email, password } = req.body;
   const salt = 8;

   try {
      // create the new user with a hashed password
      const user = await userModel.create({
         email,
         password: await bcrypt.hash(password, salt)
      });

      // generate an auth token when the user is created successfuly
      user.generateAuthToken();

      // 201 - created
      res.status(201).send(
         `User created successfuly: ${user.email} ${user._id} ${user.token}`
      );
   } catch (e) {
      // 400 - bad request
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
            return res
               .status(200)
               .send(
                  `User logged-in successfuly: ${user.email} ${user._id} ${user.token}`
               );
         }
      }

      // reject login in case of incorrect email or password
      throw new Error(`Unable to login. Incorrect email or password.`);
   } catch (e) {
      res.status(401).send(e.message);
   }
});

// user logout
router.post('/logout', auth, async (req, res) => {
   try {
      // log user out by id (delete auth token)
      await userModel.updateOne({ _id: req.body.id }, { token: '' });
      res.status(200).send('Logged out successfuly.');
   } catch (e) {
      // 500 - internal Server Error
      res.status(500).send('Error: ' + e.message);
   }
});

// update user password
router.put('/update', auth, async (req, res) => {
   try {
      const user = await userModel.findByIdAndUpdate(req.user._id, {
         password: req.body.newPassword
      });

      if (user) {
         return res.status(200).send('Password updated successfuly.');
      }

      throw new Error('Unable to update password');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// delete user
router.delete('/remove', auth, async (req, res) => {
   try {
      // remove user by id
      const user = await userModel.findByIdAndDelete(req.user._id);

      if (user) {
         return res
            .status(200)
            .send(`User profile removed successfuly: ${user}`);
      }

      throw new Error('Could not remove user profile');
   } catch (e) {
      // 500 - internal Server Error
      res.status(500).send(`Error: ${e.message}`);
   }
});

module.exports = router;
