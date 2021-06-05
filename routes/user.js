const express = require('express');
const bcrypt = require('bcrypt');
const createError = require('http-errors');

const userService = require('../services/userService');
const User = require('../models/user');
const profileRouter = require('../routes/profile');
const auth = require('../middleware/auth');

const router = express.Router();

// delegate profile related requests to the profile route
router.use('/:userId/profile', profileRouter);

// user signup
router.post('/signup', async (req, res, next) => {
   try {
      // extract email and password from request body
      const { email, password } = req.body;

      // invoke user service, create the new user
      const user = await userService.signUserUp({ email, password });

      if (user) {
         // 201 - created
         // send back generated auth token and user id
         return res.status(201).send({ id: user._id, token: user.token });
      }
   } catch (err) {
      // 400 - bad request
      next(createError(400, err));
   }
});

// user login
router.post('/login', async (req, res, next) => {
   try {
      // extract email and password from request body
      const { email, password } = req.body;

      // find user by email
      const user = await User.findOne({ email });

      if (user) {
         if (password) {
            // check password validity
            const match = await bcrypt.compare(password, user.password);

            if (match) {
               // send back auth token and user id
               return res.status(200).send({ id: user._id, token: user.token });
            }

            // in case of invalid password
            throw new Error('Invalid password');
         }

         throw new Error('Password is required');
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
         await user.save();

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
router.post('/logout', auth, async (req, res, next) => {
   try {
      // remove auth token
      const { nModified } = await User.updateOne(
         { _id: req.user._id },
         { token: null }
      );

      if (nModified) {
         return res.sendStatus(200);
      }

      throw new Error('Logout failed');
   } catch (err) {
      // 500 - internal Server Error
      next(createError(500, err));
   }
});

// delete user
router.delete('/', auth, async (req, res, next) => {
   try {
      // remove user
      const { deletedCount } = await User.deleteOne({
         _id: req.user._id,
      });

      if (deletedCount) {
         return res.status(200).send({ message: 'User removed successfully' });
      }

      throw new Error('Operation failed');
   } catch (err) {
      // 500 - internal Server Error
      next(createError(500, err));
   }
});

module.exports = router;
