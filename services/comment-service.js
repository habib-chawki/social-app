const httpError = require('http-errors');

const Comment = require('../models/comment');
const logger = require('../utils/logger');

async function createComment(owner, post, content) {
   try {
      const comment = await Comment.create({ owner, post, content });

      if (comment) {
         logger.info(
            'Comment created ' + JSON.stringify({ owner, post, content })
         );
         return comment;
      }

      throw new Error('Create comment failed');
   } catch (err) {
      logger.error('Create comment failed ' + err);
      throw httpError(500, 'Create comment failed');
   }
}

async function getComments(post, skip, limit) {
   try {
      // fetch paginated list of comments
      const comments = await Comment.find({ post })
         .skip(parseInt(skip))
         .limit(parseInt(limit));

      if (comments) {
         logger.info('Comments fetched ' + JSON.stringify(comments));
         return comments;
      }

      throw new Error('Fetching list of comments failed');
   } catch (err) {
      logger.error('Fetching list of comments failed ' + err);
      throw httpError(404, 'Fetching list of comments failed');
   }
}

module.exports = { createComment, getComments };
