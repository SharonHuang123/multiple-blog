var marked = require('marked');
var Comment = require('../lib/mongo.js').Comment;

Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content);
      return comment;
    })
  }
})

module.exports = {
  // 创建留言
  create: function create(comment) {
    return Comment.create(comment).exec();
  },

  // 读取文章所有留言
  getComments: function getComments(postId) {
    return Comment
      .find({ postId: postId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },

  // 读取文章留言数
  getCommentsCount: function getCommentsCount(postId) {
    return Comment.count({ postId: postId }).exec();
  },

  // 删除文章所有留言
  deleteCommentsByPostId: function deleteCommentsByPostId(postId) {
    return Comment.remove({ postId: postId }).exec();
  },

  // 删除某条留言
  deleteCommentById: function deleteCommentById(commentId, author) {
    return Comment.remove({ _id: commentId, author: author }).exec();
  }
}