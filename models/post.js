const mongoose = require('mongoose');

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
   },
   {
      timestamps: true,
   }
);

module.exports = mongoose.model('Post', postSchema);
