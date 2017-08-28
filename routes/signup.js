var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/user');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signup');
});

// POST /signup 用户注册
router.post('/', checkNotLogin, function (req, res, next) {
  var user = {
    name: req.fields.name,
    password: sha1(req.fields.password),
    gender: req.fields.gender,
    bio: req.fields.bio,
    avatar: req.files.avatar.path.split(path.sep).pop()
  };

  UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      // 将用户信息存入 session
      delete user.password;
      req.session.user = user;
      // 写入 flash
      req.flash('success', '注册成功');
      res.redirect(`/posts`);

      /*res.json({
        success: true,
        href: `/posts?author=${user._id}`
      });*/
    }).catch(function (e) {
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('E11000 duplicate key')) {
        /*return res.json({
          success: false,
          errorMsg: '用户名已被占用'
        });*/
        req.flash('error', '用户名已被占用');
        res.redirect('/posts');
      }
      next(e);
    })
});


module.exports = router;