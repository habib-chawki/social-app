const mongoose = require('mongoose');

const profileSchema = mongoose.Schema(
   {
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         required: true
      },
      firstName: {
         type: String,
         minLength: 3,
         maxLength: 30,
         trim: true
      },
      middleName: {
         type: String,
         minLength: 3,
         maxLength: 30,
         trim: true
      },
      lastName: {
         type: String,
         minLength: 3,
         maxLength: 30,
         trim: true
      },
      address: String,
      birthday: Date,
      gender: String,
      bio: {
         type: String,
         maxLength: 100
      },
      experience: [
         {
            _id: false,
            startDate: {
               type: Date,
               required: true
            },
            endDate: Date,
            current: {
               type: Boolean,
               default: false
            },
            position: {
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
            startDate: {
               type: Date,
               required: true
            },
            endDate: Date,
            current: {
               type: Boolean,
               default: false
            },
            major: {
               type: String,
               required: true
            },
            school: {
               type: String,
               required: true
            },
            description: {
               type: String,
               maxLength: 200
            }
         }
      ],
      skills: {
         technical: [String],
         organizational: [String]
      },
      languages: [String]
   },
   {
      timestamps: true
   }
);

module.exports = mongoose.model('Profile', profileSchema);
