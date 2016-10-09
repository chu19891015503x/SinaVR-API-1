var Joi = require('joi');
var Boom = require('boom');
var config = require('../../config');
var Jwt = require('jsonwebtoken');
var User = require('./user.model');
var _ = require('lodash');
var moment = require('moment');

module.exports.create = {
    tags: ['api'],
    description: '创建用户',
    notes: '根据指定的用户名密码创建用户',
    validate: {
        payload: {
            userName: Joi.string().email().required(),
            password: Joi.string().required()
        }
    },
    auth: {
        strategy: 'token',
        scope: ['admin']
    },
    handler: function(request, reply) {
        request.payload.scope = 'user';
        var user = new User(request.payload);
        user.save(request.payload, function(error, user) {
            if(!error) {
                reply('User created successfully, userId: '+user._id);
            } else {
                if (11000 === error.code || 11001 === error.code) {
                    reply(Boom.badRequest("User with this email already exists"));
                } else {
                    reply(Boom.badImplementation('Cannot create User'));
                }
            }
        });
    }
};

module.exports.getOne = {
    tags: ['api'],
    description: '获取用户',
    notes: '根据用户名获取指定用户信息',
    validate: {
        params: {
            userName: Joi.string().email().required()
        }
    },
    auth: false,
    handler: function(request, reply) {
        User.findOne({
            userName: request.params.userName,
            deleted: {$ne: true}
        }, function(error, user) {
            if(!error) {
                if(_.isNull(user)) {
                    reply(Boom.notFound('Cannot find user with that userName'));
                } else {
                    reply(user);
                }
            } else {
                reply(Boom.notFound('Cannot find user with that userName'));
            }
        })
    }
};

module.exports.login = {
    tags: ['api'],
    description: '登陆',
    notes: '使用用户名密码登录系统',
    validate: {
        payload: {
            userName: Joi.string().email().required(),
            password: Joi.string().required()
        }
    },
    auth: false,
    handler: function(request, reply) {
        User.findOne({
            userName: request.payload.userName,
            deleted: {$ne: true}
        }, function(error, user) {
            if(error || _.isEmpty(user) || user == null) {
                return reply(Boom.notFound('User with that userName do not exists'));
            }

            user.comparePasswords(request.payload.password, user.password, function(error, isMatch) {
                if(error) {
                    reply(Boom.badImplementation('Unknown error has occurred'));
                }
                if(isMatch) {
                    var token = {
                        userName: user.userName,
                        id: user._id,
                        scope: user.scope
                    };
                    reply({
                        token: Jwt.sign(token, config.token.privateKey)
                    });
                } else {
                    reply(Boom.badRequest('Password is wrong'));
                }
            })
        })
    }
};

module.exports.validateToken = function(decodedToken, callback) {
    if(decodedToken.userName && decodedToken.iat){
        User.findOne({
            userName: decodedToken.userName,
            deleted: {$ne: true}
        }, function(error, matched) {
            if(!_.isNull(matched)) {
                return callback(error, true, {userName: matched.userName, scope: [matched.scope]});
            } else {
                return callback(error, false, decodedToken);
            }
        });
    } else {
        return callback(Boom.badRequest('Invalid Token'), false, {})
    }
};

module.exports.getAll = {
    tags: ['api'],
    description: '获取全部用户',
    notes: '获得全部用户信息',
    auth: false,
    handler: function(request, reply) {
        User.find({ deleted: {$ne: true} }, function(error, users) {
            if(!error) {
                if(_.isEmpty(users)) {
                    reply(Boom.notFound('Cannot find any user'));
                } else {
                    reply(users);
                }
            } else {
                reply(Boom.badImplementation('Unknown error has appears'));
            }
        })
    }
};

module.exports.remove = {
    tags: ['api'],
    description: '删除用户',
    notes: '根据用户名删除指定的用户',
    validate: {
        params: {
            userName: Joi.string().email().required()
        }
    },
    auth: {
        strategy: 'token',
        scope: ['admin']
    },
    handler: function(request, reply) {
        User.findOne({
            userName: request.params.userName,
            scope: {$ne: 'admin'}
        }, function(error, user) {
            if(error) {
                reply(Boom.badImplementation('Cannot remove User'));
            } else if(_.isNull(user)) {
                reply(Boom.notFound('Cannot find user with that ID'));
            }
            user.softdelete(function(error, data) {
                if(error) {
                    reply(Boom.badImplementation('Cannot remove User'));
                } else {
                    reply({code: 200, message: 'User removed successfully'});
                }
            });
        });
    }
};
