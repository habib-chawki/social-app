const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

// authentication middleware
async function auth(req, res, next) {
   try {
      // get token from request header
      const { authorization } = req.headers;

      if (!authorization) {
         throw new Error('Not authorized.');
      }
      const token = authorization.replace('Bearer ', '');

      // verify token validity
      const payload = await jwt.verify(token, process.env.SECRET_KEY);

      if (payload) {
         // find user by id
         let user = await userModel.findById(payload.id);

         if (user) {
            // TODO: send back user information (exclude password)
            // user = user.toObject();
            // delete user.password;

            req.user = user;
            return next();
         }
      }

      // throw an error if token is invalid or user not found
      throw new Error('Not authorized.');
   } catch (e) {
      res.status(401).send(e.message);
   }
}

module.exports = auth;
