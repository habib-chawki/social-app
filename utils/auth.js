const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

// authentication middleware
async function auth(req, res, next) {
   try {
      // get token from request header
      const { authorization } = req.headers;
      const token = authorization.replace('Bearer ', '');

      // verify token validity
      const payload = await jwt.verify(token, process.env.SECRET_KEY);

      if (payload) {
         // find user by id
         const user = await userModel.findById(payload.id);

         if (user) {
            // send back user information (exclude password)
            delete user.password;

            req.user = user;
            return next();
         }
      }

      // throw an error if token is invalid or user not found
      throw new Error('Authentication error.');
   } catch (e) {
      res.status(401).send(e.message);
   }
}

module.exports = auth;
