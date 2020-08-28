const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const profileRouter = require('../routes/profile');
const auth = require('../utils/auth');

const router = express.Router();
router.use('/:userId/profile', profileRouter);

// user signup
router.post('/signup', async (req, res) => {
   try {
      // create the new user, req.body: {email, password}
      const user = await User.create(req.body);
      if (user) {
         // generate an auth token when the user is created successfuly
         await user.generateAuthToken();

         // 201 - created
         // send back generated auth token
         return res.status(201).send({
            token: user.token,
         });
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
      const user = await User.findOne({
         email,
      });
      if (user) {
         // check password validity
         const match = await bcrypt.compare(password, user.password);
         if (match) {
            // send back generated token
            await user.generateAuthToken();
            return res.status(200).send({
               token: user.token,
            });
         }
      }

      // reject login in case of incorrect email or password
      throw new Error('Unable to login. Incorrect email or password.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// update user password
router.patch('/password', auth, async (req, res) => {
   const user = req.user;
   const { oldPassword, newPassword } = req.body;
   try {
      // check if password is valid
      const match = await bcrypt.compare(oldPassword, user.password);

      if (match) {
         // find user by id and patch the password (after hashing)
         const newPasswordHash = await bcrypt.hash(newPassword, 8);
         const { nModified } = await User.updateOne(
            {
               _id: user._id,
            },
            {
               password: newPasswordHash,
            }
         );

         if (nModified) {
            return res.status(200).send('Password updated.');
         }
      }

      throw new Error('Unable to update password.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// user logout
router.post('/logout', auth, async (req, res) => {
   try {
      // remove auth token
      const { nModified } = await User.updateOne(
         { _id: req.user._id },
         { token: null }
      );

      if (nModified) {
         return res.sendStatus(200);
      }

      throw new Error('Unable to logout');
   } catch (e) {
      // 500 - internal Server Error
      res.status(500).send(e.message);
   }
});

// delete user
router.delete('/', auth, async (req, res) => {
   try {
      // remove user
      const { deletedCount } = await User.deleteOne({
         _id: req.user._id,
      });

      if (deletedCount) {
         return res.status(200).send('User removed.');
      }

      throw new Error('Unable to remove user.');
   } catch (e) {
      // 500 - internal Server Error
      res.status(500).send(e.message);
   }
});

module.exports = router;
