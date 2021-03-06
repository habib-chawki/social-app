const mongoose = require('mongoose');

const profileSchema = mongoose.Schema(
   {
      avatar: {
         type: Buffer,
         default: null,
      },
      firstName: {
         type: String,
         maxLength: 30,
         trim: true,
         default: '',
      },
      middleName: {
         type: String,
         maxLength: 30,
         trim: true,
         default: '',
      },
      lastName: {
         type: String,
         maxLength: 30,
         trim: true,
         default: '',
      },
      address: { type: String, default: '' },
      birthday: { type: Date, default: Date.now() },
      gender: { type: String, default: 'Unknown' },
      bio: {
         type: String,
         maxLength: 100,
         default: '',
      },
      experience: [
         {
            _id: false,
            startDate: {
               type: Date,
               required: true,
            },
            endDate: Date,
            current: {
               type: Boolean,
               default: false,
            },
            position: {
               type: String,
               required: true,
            },
            company: {
               type: String,
               required: true,
            },
            description: {
               type: String,
               maxLength: 200,
            },
         },
      ],
      education: [
         {
            _id: false,
            startDate: {
               type: Date,
               required: true,
            },
            endDate: Date,
            current: {
               type: Boolean,
               default: false,
            },
            major: {
               type: String,
               required: true,
            },
            school: {
               type: String,
               required: true,
            },
            description: {
               type: String,
               maxLength: 200,
            },
         },
      ],
      skills: {
         technical: [String],
         organizational: [String],
      },
      languages: [String],
   },
   {
      timestamps: true,
   }
);

module.exports = profileSchema;
