const mongoose = require('mongoose');

const profileSchema = mongoose.Schema(
   {
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         required: true
      },
      firstname: {
         type: String,
         minLength: 3,
         maxLength: 30,
         trim: true
      },
      middlename: {
         type: String,
         minLength: 3,
         maxLength: 30,
         trim: true
      },
      lastname: {
         type: String,
         minLength: 3,
         maxLength: 30,
         trim: true
      },
      birthday: {
         type: Date
      },
      location: String,
      bio: {
         type: String,
         maxLength: 100
      },
      experience: [
         {
            _id: false,
            startdate: {
               type: Date,
               required: true
            },
            enddate: {
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
               maxLength: 200
            }
         }
      ],
      education: [
         {
            _id: false,
            startdate: {
               type: Date,
               required: true
            },
            enddate: {
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
               maxLength: 200
            }
         }
      ]
   },
   {
      timestamps: true
   }
);

module.exports = mongoose.model('profile', profileSchema);
