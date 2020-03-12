const userModel = require('../models/user');

// authentication middleware
async function auth(req, res, next) {
   // authenticate users with email (unique) and token
   const { email, token } = req.body;

   try {
      // find user by email and populate posts
      const user = await userModel
         .findOne({ email })
         .populate('posts')
         .exec();

      if (user) {
         // check token validity
         if (user.token === token) {
            // send back user information (exclude password)
            delete user.password;

            req.body.user = user;
            return next();
         }
      }

      // throw an error in case of incorrect email or invalid token
      throw new Error('Authentication error.');
   } catch (e) {
      // 401 - unauthorized
      res.status(401).send(e.message);
   }
}

module.exports = auth;
