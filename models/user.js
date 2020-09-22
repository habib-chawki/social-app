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
         required: [true, 'Email is required.'],
         trim: true,
         unique: true,
         lowercase: true,
         validate(value) {
            if (!validator.isEmail(value)) {
               throw new Error('Invalid Email.');
            }
         },
      },
      password: {
         type: String,
         trim: true,
         required: [true, 'Password is required.'],
         minlength: 5,
      },
      token: {
         type: String,
         validate(value) {
            if (!validator.isJWT(value)) {
               throw new Error('Invalid token.');
            }
         },
      },
      profile: { type: profileSchema, default: profileSchema },
   },
   {
      timestamps: true,
   }
);

// hash password before saving
userSchema.pre('save', async function () {
   try {
      // hash password only if it has been modified
      if (this.isModified('password'))
         this.password = await bcrypt.hash(this.password, 8);
   } catch (e) {
      throw new Error('Encryption failed.');
   }
});

// instance method to generate authentication token
userSchema.methods.generateAuthToken = async function () {
   try {
      // sign the token with the user id
      this.token = await jwt.sign({ id: this._id }, process.env.SECRET_KEY);
      await this.save();
   } catch (e) {
      throw new Error('Unable to generate token: ' + e.message);
   }
};

// handle duplicate key error
userSchema.post('save', function (error, doc, next) {
   if (error.name === 'MongoError' && error.code === 11000) {
      return next(new Error('Email already exists.'));
   }

   next();
});

module.exports = mongoose.model('User', userSchema);
