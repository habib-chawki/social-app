const express = require('express');
const httpError = require('http-errors');

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

   if (!email || !password) {
      next(httpError(400, 'Email and password are required'));
   }

   // invoke user service, create the new user
   userService
      .signUserUp({ email, password })
      .then((user) => {
         res.status(201).send({ id: user._id, token: user.token });
      })
      .catch((err) => {
         next(err);
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
         next(httpError(400, err));
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
      next(httpError(400, err));
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
      next(httpError(500, err));
   }
});

// delete user
router.delete('/', auth, (req, res, next) => {
   const userId = req.user._id;

   userService
      .deleteUser(userId)
      .then(() => {
         res.status(200).send({ message: 'User removed successfully' });
      })
      .catch((err) => {
         next(httpError(500, err));
      });
});

module.exports = router;
