const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
   userId: mongoose.Schema.Types.ObjectId,
   postId: mongoose.Schema.Types.ObjectId,
   content: String,
});

module.export = mongoose.model('Comment', commentSchema);
