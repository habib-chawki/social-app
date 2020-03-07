const mongoose = require('mongoose');

// define post Schema (owner and content)
//TODO: add a list of comments
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
      }
   },
   {
      timestamps: true
   }
);

module.exports = mongoose.model('post', postSchema);
