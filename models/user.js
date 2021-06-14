const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');

const profileSchema = require('../schema/profile');

// define user Schema
const userSchema = mongoose.Schema(
   {
      email: {
         type: String,
         required: [true, 'Email is required'],
         trim: true,
         unique: true,
         lowercase: true,
         validate(value) {
            if (!validator.isEmail(value)) {
               throw new Error('Invalid Email');
            }
         },
      },
      password: {
         type: String,
         trim: true,
         required: [true, 'Password is required'],
         minlength: [5, 'Password should be at least 5 characters long'],
      },
      token: {
         type: String,
         validate(value) {
            if (!validator.isJWT(value)) {
               throw new Error('Invalid token');
            }
         },
      },
      profile: { type: profileSchema, default: () => ({}) },
   },
   {
      timestamps: true,
   }
);

// hash password before saving
userSchema.pre('save', async function () {
   try {
      // hash password only if it has been modified
      if (this.isModified('password')) {
         this.password = await bcrypt.hash(this.password, 8);
      }
   } catch (err) {
      throw new Error('Unexpected error');
   }
});

// generate authentication token
userSchema.pre('save', async function () {
   try {
      if (!this.token) {
         // sign the token with the user id
         this.token = await jwt.sign({ id: this._id }, process.env.SECRET_KEY);
      }
   } catch (e) {
      throw new Error('Unexpected error');
   }
});

// handle duplicate email error
userSchema.post('save', function (error, doc, next) {
   if (error.name === 'MongoError' && error.code === 11000) {
      return next(new Error('An account with this email already exists'));
   }

   next();
});

module.exports = mongoose.model('User', userSchema);
