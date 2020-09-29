const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
   {
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
      },
      content: {
         type: String,
         required: [true, 'Content is required'],
         trim: true,
      },
      comments: {
         type: [
            {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Comment',
            },
         ],
         default: [],
      },
   },
   {
      timestamps: true,
   }
);

module.exports = mongoose.model('Post', postSchema);
