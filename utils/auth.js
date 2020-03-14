const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

// authentication middleware
function auth(req, res, next) {
   // get token from request header
   const { authorization } = req.headers;

   // remove Bearer prefix
   const token = authorization.replace('Bearer ', '');

   // verify token validity
   jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
      if (err) {
         return res.status(401).send('Unauthorized access.');
      }

      try {
         const user = await userModel.findById(payload.id);

         if (user) {
            // send back user information (exclude password)
            delete user.password;

            req.user = user;
            return next();
         }

         throw new Error('Authentication error.');
      } catch (e) {
         // 401 - unauthorized
         res.status(401).send(e.message);
      }
   });
}

module.exports = auth;
