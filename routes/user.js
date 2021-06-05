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
router.post('/signup', (req, res, next) => {
   // extract email and password from request body
   const { email, password } = req.body;

   // invoke user service, create the new user
   userService
      .signUserUp({ email, password })
      .then((user) => {
         res.status(201).send({ id: user._id, token: user.token });
      })
      .catch((err) => {
         next(createError(400, err));
      });
});

// user login
router.post('/login', (req, res, next) => {
   // extract email and password from request body
   const { email, password } = req.body;

   // invoke user service, log user in
   userService
      .logUserIn({ email, password })
      .then((user) => {
         res.status(200).send({ id: user._id, token: user.token });
      })
      .catch((err) => {
         next(createError(400, err));
      });
});

// update user password
router.patch('/password', auth, async (req, res, next) => {
   try {
      // extract old and new passwords from request body
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
         throw new Error('Both old and new password fields are required');
      }

      // invoke user service, update password
      await userService.updatePassword(req.user, oldPassword, newPassword);

      res.status(200).send({ message: 'Password updated successfully' });
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
