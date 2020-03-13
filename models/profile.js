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
         title: {
            type: String,
            required: true
         },
         company: {
            type: String,
            required: true
         },
         startDate: {
            type: Date,
            required: true
         },
         endDate: {
            type: Date
         },
         description: {
            type: String,
            maxLength: 100
         }
      }
   ]
});

module.exports = mongoose.model('profile', profileSchema);
