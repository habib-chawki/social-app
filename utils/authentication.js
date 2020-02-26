const userModel = require('../models/user');

async function auth(req, res, next) {
   const { email, token } = req.body;
   try {
      // find user by email
      const user = await userModel.findOne({ email });
      if (user) {
         // check token validity
         if (user.token === token) {
            req.body.user = user;
            return next();
         }
      }

      // throw an error in case of incorrect email or invalid token
      throw new Error('Authentication error');
   } catch (e) {
      res.status(400).send(e.message);
   }
}

module.exports = auth;
