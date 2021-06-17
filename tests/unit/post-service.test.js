const postService = require('../../services/post-service');
const Post = require('../../models/post');

jest.mock('../../models/post');

const post = {
   _id: '507f1f77bcf86cd799439010',
   owner: '507f1f77bcf86cd799439011',
   content: 'This is a post',
   comments: [],
};

fit('should create post', () => {
   // given the post model create method response
   Post.create.mockResolvedValue(post);

   // when createPost is invoked
   postService.createPost(post.owner, post.content).then((createdPost) => {
      // then expect the post to have been created
      expect(createdPost).toBe(post);
   });
});

fit('should get post by id', () => {});
