const mongoose = require('mongoose');
const validator = require('validator');

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
   }
});

module.exports = mongoose.model('user', userSchema);
