const commentService = require('../../services/comment-service');
const Comment = require('../../models/comment');

const comment = {
   _id: '507f1f77bcf86cd799439010',
   owner: '507f1f77bcf86cd799439020',
   post: '507f1f77bcf86cd799439030',
   content: 'This is a comment',
};

it('should create comment', async () => {
   Comment.create = jest.fn().mockReturnValue(comment);

   const response = await commentService.createComment(
      comment.owner,
      comment.post,
      comment.content
   );

   expect(response).toEqual(comment);
});
