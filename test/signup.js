var path = require('path');
var assert = require('assert');
var request = require('supertest');
var app = require('../index');
var User = require('../lib/mongo').User;

describe('signup', function () {
  describe('POST /signup', function () {
    var agent = request.agent(app);
    before(function (done) {
      User.create({
        name: 'aaa',
        password: '123456',
        gender: 'x',
        bio: '',
        avatar: ''
      })
        .exec()
        .then(function () {
          done();
        })
        .catch(done);
    });

    after(function (done) {
      User.remove({})
        .exec()
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('duplicate name', function (done) {
      agent.post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({
          name: 'aaa',
          password: '123456',
          gender: 'x',
          bio: ''
        })
        .redirects()
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          assert(res.text.match(/用户名已被占用/));
          done();
        })
    });

    it('success', function (done) {
      agent.post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({
          name: 'bbb',
          password: '123456',
          gender: 'x',
          bio: ''
        })
        .redirects()
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          assert(res.text.match(/注册成功/));
          done();
        })
    });
  });

  describe('GET /signup', function () {
    var agent = request.agent(app);
    it('success', function (done) {
      agent.get('/signup')
        .expect(200, done)
    });
  });
});