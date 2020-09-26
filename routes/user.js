const express = require('express');
const bcrypt = require('bcrypt');
const createError = require('http-errors');

const User = require('../models/user');
const profileRouter = require('../routes/profile');
const auth = require('../middleware/auth');

const router = express.Router();
router.use('/:userId/profile', profileRouter);

// user signup
router.post('/signup', async (req, res, next) => {
   try {
      // retrieve email and password from request body
      const { email, password } = req.body;

      // create the new user
      const user = await User.create({ email, password });

      if (user) {
         // generate an auth token when the user is created successfuly
         await user.generateAuthToken();

         // 201 - created
         // send back generated auth token
         return res.status(201).send({ token: user.token });
      }

      // last resort
      throw new Error('Signup failed');
   } catch (err) {
      // 400 - bad request
      next(createError(400, err));
   }
});

// user login
router.post('/login', async (req, res, next) => {
   try {
      // retrieve email and password from request body
      const { email, password } = req.body;

      // find user by email
      const user = await User.findOne({ email });

      if (user) {
         if (password) {
            // check password validity
            const match = await bcrypt.compare(password, user.password);

            if (match) {
               // generate token and send it back
               await user.generateAuthToken();
               return res.status(200).send({ token: user.token });
            }

            // in case of invalid password
            throw new Error('Invalid password');
         }

         throw new Error('Required password');
      }

      // last resort
      throw new Error('Invalid email');
   } catch (err) {
      next(createError(400, err));
   }
});

// update user password
router.patch('/password', auth, async (req, res, next) => {
   try {
      // retrieve old and new passwords from request body
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
         throw new Error('Both old and new password fields are required');
      }

      const user = req.user;

      // check if password is correct
      const match = await bcrypt.compare(oldPassword, user.password);

      if (match) {
         // new password should not be the same as the old password
         if (oldPassword === newPassword) {
            throw new Error('Can not use the same password');
         }

         // update password
         user.password = newPassword;
         user.save();

         return res
            .status(200)
            .send({ message: 'Password updated successfully' });
      }

      throw new Error('Incorrect password');
   } catch (err) {
      next(createError(400, err));
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
