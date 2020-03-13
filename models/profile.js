const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
   firstName: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: true,
      trim: true
   },
   middleName: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: false,
      trim: true
   },
   lastName: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: true,
      trim: true
   },
   birthday: {
      type: Date,
      required: true
   },
   location: String,
   bio: {
      type: String,
      maxLength: 100
   },
   experience: [
      {
         startDate: {
            type: Date,
            required: true
         },
         endDate: {
            type: Date
         },
         current: {
            type: Boolean,
            default: false
         },
         title: {
            type: String,
            required: true
         },
         company: {
            type: String,
            required: true
         },
         description: {
            type: String,
            maxLength: 150
         }
      }
   ],
   education: [
      {
         startDate: {
            type: Date,
            required: true
         },
         endDate: {
            type: Date
         },
         current: {
            type: Boolean,
            default: false
         },
         major: {
            type: String,
            required: true
         },
         description: {
            type: String,
            maxLength: 150
         }
      }
   ]
});

module.exports = mongoose.model('profile', profileSchema);
