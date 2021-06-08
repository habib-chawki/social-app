const express = require('express');
const httpError = require('http-errors');
const isMongoId = require('validator/lib/isMongoId');

const userService = require('../services/userService');
const logger = require('../utils/logger');
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
      logger.error(
         'Required email and password ' + JSON.stringify({ email, password })
      );
      return next(httpError(400, 'Email and password are required'));
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

   if (!email || !password) {
      logger.error(
         'Required email and password ' + JSON.stringify({ email, password })
      );
      next(httpError(400, 'Email and password are required'));
   }

   // invoke user service, log user in
   userService
      .logUserIn({ email, password })
      .then((user) => {
         res.status(200).send({ id: user._id, token: user.token });
      })
      .catch((err) => {
         next(err);
      });
});

// update user password
router.patch('/password', auth, (req, res, next) => {
   // extract old and new passwords from request body
   const { oldPassword, newPassword } = req.body;

   if (!oldPassword || !newPassword) {
      logger.error(
         'Old and new password fields are required ' +
            JSON.stringify({ oldPassword, newPassword })
      );
      next(httpError(400, 'Old and new passwords are required'));
   }

   // invoke user service, update password
   userService
      .updatePassword(req.user, oldPassword, newPassword)
      .then(() => {
         res.status(200).send({ message: 'Password updated successfully' });
      })
      .catch((err) => next(err));
});

// user logout
router.post('/logout', auth, (req, res, next) => {
   userService
      .logUserOut()
      .then(() => {
         res.sendStatus(200);
      })
      .catch((err) => {
         next(err);
      });
});

// delete user
router.delete('/', auth, (req, res, next) => {
   const userId = req.user._id;

   if (!isMongoId(userId)) {
      next(httpError(400, 'Invalid user id'));
   }

   userService
      .deleteUser(userId)
      .then(() => {
         res.status(200).send({ message: 'User removed successfully' });
      })
      .catch((err) => {
         next(err);
      });
});

module.exports = router;
