const jwt = require('jsonwebtoken');
const httpError = require('http-errors');

const User = require('../models/user');

// authentication middleware
async function auth(req, res, next) {
   try {
      // retrieve token from request header
      const { authorization } = req.headers;

      // ensure authorization header is populated
      if (!authorization) {
         throw httpError(401, 'Unauthorized');
      }

      // extract token from request header
      const token = authorization.replace('Bearer ', '');

      // verify token validity (originally signed with user id)
      const payload = await jwt.verify(token, process.env.SECRET_KEY);

      if (payload) {
         // find user by id
         const user = await User.findById(payload.id);

         if (user) {
            // send back user information
            req.user = user;
            return next();
         }
      }

      // throw an error if token is invalid or user not found
      throw httpError(401, 'Unauthorized');
   } catch (err) {
      next(err);
   }
}

module.exports = auth;
