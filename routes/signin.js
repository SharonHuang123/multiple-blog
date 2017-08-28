var express = require('express');
var sha1 = require('sha1');
var router = express.Router();

var UserModel = require('../models/user');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signin');
});

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
  var name = req.fields.name;
  var password = sha1(req.fields.password);

  UserModel.getUserByName(name)
    .then(function (user) {
      if (!user) {
        req.flash('error', '用户不存在');
        return res.redirect('back');
      }

      if (user.password !== password) {
        req.flash('error', '用户密码错误');
        return res.redirect('back');
      }

      req.flash('success', '登录成功');
      // 用户信息写入 session
      delete user.password;
      req.session.user = user;

      res.redirect(`/posts`);
    })
    .catch(next);
});

module.exports = router;