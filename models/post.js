const mongoose = require('mongoose');

// define post Schema (owner, content and a list of comments)
const postSchema = mongoose.Schema(
   {
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
      },
      content: {
         type: String,
         required: true,
         trim: true,
      },
      comments: {
         type: [
            {
               id: mongoose.Schema.Types.ObjectId,
               owner: mongoose.Schema.Types.ObjectId,
               comment: String,
            },
         ],
      },
   },
   {
      timestamps: true,
   }
);

module.exports = mongoose.model('Post', postSchema);
