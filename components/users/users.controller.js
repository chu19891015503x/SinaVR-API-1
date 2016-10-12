'use strict';

var Joi = require('joi');
var Boom = require('boom');
var config = require('../../config');
var Jwt = require('jsonwebtoken');
var User = require('./user.model');
var _ = require('lodash');
var moment = require('moment');
var UsersService = require('./users.service')

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
    auth: false,
    handler: UsersService.create
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
    handler: UsersService.getOne
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
    handler: UsersService.login
};

module.exports.getAll = {
    tags: ['api'],
    description: '获取全部用户',
    notes: '获得全部用户信息',
    auth: false,
    handler: UsersService.getAll
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
    handler: UsersService.remove
};
