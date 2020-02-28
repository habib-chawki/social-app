const mongoose = require('mongoose');

// define post Schema (owner, content & list of comments)
const postSchema = mongoose.Schema({
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
      type: [String],
      trim: true
   }
});

module.export = mongoose.model('post', postSchema);
