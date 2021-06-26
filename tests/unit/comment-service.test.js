const commentService = require('../../services/comment-service');
const Comment = require('../../models/comment');

const comment = {
   _id: '507f1f77bcf86cd799439010',
   owner: '507f1f77bcf86cd799439020',
   post: '507f1f77bcf86cd799439030',
   content: 'This is a comment',
};

it('should create comment', async () => {
   // given the create comment function
   Comment.create = jest.fn().mockReturnValue(comment);

   // when the service is invoked to create a comment
   const response = await commentService.createComment(
      comment.owner,
      comment.post,
      comment.content
   );

   // then expect the comment to have been created succefully
   expect(response).toEqual(comment);
   expect(Comment.create.mock.calls[0][0]).toEqual({
      owner: comment.owner,
      post: comment.post,
      content: comment.content,
   });
});

it('should delete comment by id', async () => {
   Comment.findOneAndDelete = jest.fn().mockReturnValue(comment);

   const response = await commentService.deleteComment(
      comment._id,
      comment.owner,
      comment.post
   );

   expect(response).toEqual(comment);
});
