const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// define user Schema
const userSchema = mongoose.Schema(
   {
      email: {
         type: String,
         required: true,
         trim: true,
         unique: true,
         lowercase: true,
         validate(value) {
            if (!validator.isEmail(value)) {
               throw new Error('Invalid Email.');
            }
         }
      },
      password: {
         type: String,
         trim: true,
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
      },
      posts: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
         }
      ]
   },
   {
      timestamps: true
   }
);

// hash password before saving
userSchema.pre('save', async function() {
   try {
      // hash password only if it has been modified
      if (this.isModified('password'))
         this.password = await bcrypt.hash(this.password, 8);
   } catch (e) {
      throw new Error('Encryption failed.');
   }
});

// instance method to generate authentication token
userSchema.methods.generateAuthToken = async function() {
   try {
      // sign the token with the user id
      this.token = await jwt.sign({ id: this._id }, process.env.SECRET_KEY);
      await this.save();
   } catch (e) {
      throw new Error('Unable to generate token: ' + e.message);
   }
};

module.exports = mongoose.model('User', userSchema);
