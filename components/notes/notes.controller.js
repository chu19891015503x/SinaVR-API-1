'use strict';

var Joi = require('joi');
var Boom = require('boom');
var config = require('../../config');
var Jwt = require('jsonwebtoken');
var Note = require('./note.model');
var _ = require('lodash');
var moment = require('moment');
var NotesService = require('./notes.service');

module.exports.create = {
    tags: ['api'],
    description: '创建帖子',
    notes: '创建一篇新的帖子',
    validate: {
        payload: {
            title: Joi.string().required(),
            content: Joi.string().required(),
            cover: Joi.string().uri().required(),
            media: Joi.string().uri().required()
        }
    },
    auth: {
        strategy: 'token',
        scope: ['admin']
    },
    handler: NotesService.create
};

module.exports.getOne = {
    tags: ['api'],
    description: '获取帖子',
    notes: '根据帖子id获得帖子详情',
    validate: {
        params: {
            noteId: Joi.number().integer()
        }
    },
    auth: false,
    handler: NotesService.getOne
};

module.exports.getAll = {
    tags: ['api'],
    description: '获取全部帖子',
    notes: '获得全部帖子信息',
    validate: {
        query: {
            page: Joi.number().integer().description('页号，默认值 1'),
            pageSize: Joi.number().integer().description('每页条数，默认 20')
        }
    },
    auth: false,
    handler: NotesService.getAll
};

module.exports.remove = {
    tags: ['api'],
    description: '删除帖子',
    notes: '根据帖子id删除指定帖子',
    validate: {
        params: {
            noteId: Joi.number().integer()
        }
    },
    auth: {
        strategy: 'token',
        scope: ['admin']
    },
    handler: NotesService.remove
};
