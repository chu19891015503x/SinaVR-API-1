'use strict';

var Boom = require('boom');
var User = require('./user.model');
var _ = require('lodash');

module.exports.create = function(request, reply) {
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
};

module.exports.getOne = function(request, reply) {
    User.findOne({
        userName: request.params.userName,
        deleted: {$ne: true}
    }).lean().exec(function(error, user) {
        if(!error) {
            if(_.isNull(user)) {
                reply(Boom.notFound('Cannot find user with that userName'));
            } else {
                reply(user);
            }
        } else {
            reply(Boom.notFound('Cannot find user with that userName'));
        }
    });
};

module.exports.login = function(request, reply) {
    User.findOne({
        userName: request.payload.userName,
        deleted: {$ne: true}
    }).lean().exec(function(error, user) {
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
    });
};

module.exports.validateToken = function(decodedToken, callback) {
    if(decodedToken.userName && decodedToken.iat){
        User.findOne({
            userName: decodedToken.userName,
            deleted: {$ne: true}
        }).lean().exec(function(error, matched) {
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

module.exports.getAll = function(request, reply) {
    var page = request.query.page || 1;
    var pageSize = request.query.pageSize || 10;
    var start = (page - 1) * pageSize;
    User.find({ deleted: {$ne: true} }).skip(start).limit(pageSize).sort({createdAt:'desc'}).lean().exec(function(error, users) {
      if(!error) {
            if(_.isEmpty(users)) {
                reply(Boom.notFound('Cannot find any user'));
            } else {
                reply(users);
            }
        } else {
            reply(Boom.badImplementation('Unknown error has appears'));
        }
    });
};

module.exports.remove = function(request, reply) {
    User.findOne({
        userName: request.params.userName,
        scope: {$ne: 'admin'}
    }, function(error, user) {
        if(error) {
            return reply(Boom.badImplementation('Cannot remove User'));
        } else if(_.isNull(user)) {
            return reply(Boom.notFound('Cannot find user with that ID'));
        } else if(!user.deleted) {
            user.softdelete(function(error, data) {
                if(error) {
                    reply(Boom.badImplementation('Cannot remove User'));
                } else {
                    reply({code: 200, message: 'User removed successfully'});
                }
            });
        }
        else {
            reply(Boom.badImplementation('User has already removed'));
        }
    });
};
