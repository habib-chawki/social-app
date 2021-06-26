const commentService = require('../../services/comment-service');
const Comment = require('../../models/comment');

const comment = {
   _id: '507f1f77bcf86cd799439010',
   owner: '507f1f77bcf86cd799439020',
   post: '507f1f77bcf86cd799439030',
   content: 'This is a comment',
};

const comment2 = {
   _id: '507f1f77bcf86cd799439040',
   owner: '507f1f77bcf86cd799439050',
   post: '507f1f77bcf86cd799439030',
   content: 'This is another comment',
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

it('should get post comments', async () => {
   const skip = 0;
   const limit = 5;
   Comment.find = jest.fn(() => ({
      skip: jest.fn(() => ({
         limit: jest.fn().mockReturnValue([comment, comment2]),
      })),
   }));

   const response = await commentService.getComments(comment.post, skip, limit);

   expect(response).toEqual([comment, comment2]);
});

it('should update comment', async () => {
   // given the new comment content
   const newComment = { ...comment, content: 'updated content' };
   Comment.findOneAndUpdate = jest.fn().mockReturnValue(newComment);

   // when the service is invoked to update the comment
   const response = await commentService.updateComment(
      comment._id,
      comment.owner,
      comment.post,
      newComment.content
   );

   // then expect the comment to have been updated
   expect(response).toStrictEqual(newComment);
   expect(Comment.findOneAndUpdate.mock.calls[0][0]).toEqual({
      _id: comment._id,
      owner: comment.owner,
      post: comment.post,
   });
   expect(Comment.findOneAndUpdate.mock.calls[0][1]).toEqual({
      content: newComment.content,
   });
});

it('should delete comment by id', async () => {
   Comment.findOneAndDelete = jest.fn().mockReturnValue(comment);

   // when the service is invoked to delete a comment by id
   const response = await commentService.deleteComment(
      comment._id,
      comment.owner,
      comment.post
   );

   // then expect the comment to have been deleted successfully
   expect(response).toEqual(comment);
   expect(Comment.findOneAndDelete.mock.calls[0][0]).toEqual({
      _id: comment._id,
      owner: comment.owner,
      post: comment.post,
   });
});
