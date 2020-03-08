const mongoose = require('mongoose');

// define post Schema (owner and content)
const postSchema = mongoose.Schema(
   {
      owner: {
         type: mongoose.Types.ObjectId,
         ref: 'user'
      },
      content: {
         type: String,
         required: true,
         trim: true
      },
      comments: {
         type: [String]
      }
   },
   {
      timestamps: true
   }
);

module.exports = mongoose.model('post', postSchema);
