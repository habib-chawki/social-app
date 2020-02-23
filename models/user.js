const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

// define user Schema
const userSchema = mongoose.Schema({
   name: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 30,
      match: /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/i
   },
   email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
         if (!validator.isEmail(value)) {
            throw new Error('Invalid Email !');
         }
      }
   },
   password: {
      type: String,
      required: true,
      minlength: 5
   },
   token: {
      type: String,
      validate(value) {
         if (!validator.isJWT(value)) {
            throw new Error('Invalid token !');
         }
      }
   }
});

// add instance method to userSchema to generate authentication token
userSchema.methods.generateAuthToken = async function() {
   try {
      this.token = await jwt.sign(
         { id: this._id.toString(), email: this.email },
         process.env.SECRET_KEY
      );
      await this.save();
   } catch (e) {
      throw new Error('Unable to generate authentication token: ' + e.message);
   }
};

module.exports = mongoose.model('user', userSchema);
