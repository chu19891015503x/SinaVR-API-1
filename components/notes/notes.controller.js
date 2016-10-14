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
        payload: Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            cover: Joi.string().uri().required(),
            media: Joi.string().uri().required()
        }).label('Note')
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
            noteId: Joi.number().integer().required()
        }
    },
    auth: false,
    handler: NotesService.getOne
};

module.exports.updateOne = {
    tags: ['api'],
    description: '更新帖子',
    notes: '根据帖子id更新帖子内容',
    validate: {
        params: {
            noteId: Joi.number().integer().required()
        },
        payload: Joi.object({
            title: Joi.string(),
            content: Joi.string(),
            cover: Joi.string().uri(),
            media: Joi.string().uri()
        }).label('Note')
    },
    auth: {
        strategy: 'token',
        scope: ['admin']
    },
    handler: NotesService.updateOne
};

module.exports.getAll = {
    tags: ['api'],
    description: '获取全部帖子',
    notes: '获得全部帖子信息',
    validate: {
        query: {
            lastId: Joi.number().integer().description('起始Id，为空从头开始'),
            pageSize: Joi.number().integer().min(1).max(100).default(20).description('每页条数(1-100)')
        }
    },
    auth: false,
    response: {
        sample: 50,
        schema: Joi.array().items(Joi.object({
            noteId: Joi.number().required(),
            title: Joi.string().required(),
            content: Joi.string().required(),
            cover: Joi.string().uri().required(),
            media: Joi.string().uri().required(),
            scope: Joi.string().required(),
            createdAt : Joi.date().required()
        }).label('Note')).label('Notes')
    },
    plugins: {
        'hapi-swagger': {
            responses: {
                '200': {'description': 'Success'},
                '201': {'description': 'Note has already removed'},
                '400': {'description': 'Bad Request'}
            }
        }
    },
    handler: NotesService.getAll
};

module.exports.remove = {
    tags: ['api'],
    description: '删除帖子',
    notes: '根据帖子id删除指定帖子',
    validate: {
        params: {
            noteId: Joi.number().integer().required()
        }
    },
    auth: {
        strategy: 'token',
        scope: ['admin']
    },
    handler: NotesService.remove
};
