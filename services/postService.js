const httpError = require('http-errors');

const Post = require('../models/post');
const logger = require('../utils/logger');

async function createPost(userId, postContent) {
   try {
      // create new post
      const post = await Post.create({
         owner: userId,
         content: postContent,
      });

      // return post when created successfully
      logger.info('Post created ' + JSON.stringify({ userId, postContent }));
      return post;
   } catch (err) {
      logger.error(
         'Could not create post ' + JSON.stringify({ userId, postContent })
      );
      throw httpError(500, 'Could not create post');
   }
}

module.exports = { createPost };
