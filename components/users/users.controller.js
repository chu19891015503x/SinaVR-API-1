'use strict';

var Joi = require('joi');
var config = require('../../config');
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
    validate: {
        query: {
            lastId: Joi.number().integer().description('起始Id，为空从头开始'),
            pageSize: Joi.number().integer().min(1).max(100).default(20).description('每页条数(1-100)')
        }
    },
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
