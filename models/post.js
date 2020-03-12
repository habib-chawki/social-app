const mongoose = require('mongoose');

// define post Schema (owner, content and a list of comments)
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
         type: [
            {
               id: mongoose.Types.ObjectId,
               owner: mongoose.Types.ObjectId,
               comment: String
            }
         ]
      }
   },
   {
      timestamps: true
   }
);

module.exports = mongoose.model('post', postSchema);
