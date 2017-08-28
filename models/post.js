var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('../models/comment');

// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = marked(post.content);
      return post;
    });
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content);
    }
    return post;
  }
});

Post.plugin('getBrief', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = post.content.substr(0, 200);
      return post;
    });
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = post.content.substr(0, 200);
    }
    return post;
  }
})

Post.plugin("addCommentsCount", {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel
        .getCommentsCount(post._id)
        .then(function (commentsCount) {
          post.commentsCount = commentsCount;
          return post;
        });
    }));
  },
  afterFindOne: function (post) {
    return CommentModel.getCommentsCount(post._id).then(function (commentCount) {
      post.commentsCount = commentCount;
      return post;
    })
  }
})

module.exports = {
  // 创建一篇文章
  create: function create(post) {
    return Post.create(post).exec();
  },

  // 通过文章 id 获取一篇文章
  getPostById: function getPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  getPosts: function getPosts(author) {
    var query = {};
    if (author) {
      query.author = author;
    }
    return Post
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .getBrief()
      .exec();
  },

  // 通过文章 id 给 pv 加 1
  incPv: function incPv(postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec();
  },

  getRawPostById: function (postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec();
  },

  updatePostById: function (postId, author, data) {
    return Post.update({ author: author, _id: postId }, { $set: data }).exec();
  },

  deletePostById: function (postId, author) {
    return Post.remove({ author: author, _id: postId }).exec();
  }
};