const jwt = require('jsonwebtoken');
const User = require('../models/user');

// authentication middleware
async function auth(req, res, next) {
   try {
      // retrieve token from request header
      const { authorization } = req.headers;

      // ensure authorization header is populated
      if (!authorization) {
         throw new Error('Unauthorized.');
      }
      const token = authorization.replace('Bearer ', '');

      // verify token validity (originally signed with user id)
      const payload = await jwt.verify(token, process.env.SECRET_KEY);

      if (payload) {
         // find user by id and populate posts list
         const user = await User.findById(payload.id).populate('posts').exec();

         if (user) {
            // send back user information
            req.user = user;
            return next();
         }
      }

      // throw an error if token is invalid or user not found
      throw new Error('Unauthorized.');
   } catch (e) {
      res.status(401).send(e.message);
   }
}

module.exports = auth;
