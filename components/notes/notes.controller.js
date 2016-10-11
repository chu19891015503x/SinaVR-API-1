'use strict';

var Joi = require('joi');
var Boom = require('boom');
var config = require('../../config');
var Jwt = require('jsonwebtoken');
var Note = require('./note.model');
var _ = require('lodash');
var moment = require('moment');

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
    handler: function(request, reply) {
        var note = new Note(request.payload);
        note.save(request.payload, function(error, note) {
            if(!error) {
                reply('Note created successfully, noteId: '+note.noteId);
            } else {
                reply(Boom.badImplementation('Cannot create Note'));
            }
        });
    }
};

module.exports.getOne = {
    tags: ['api'],
    description: '获取帖子',
    notes: '根据帖子id获得帖子详情',
    validate: {
        params: {
            noteId: Joi.string().regex(/[0-9]/)
        }
    },
    auth: false,
    handler: function(request, reply) {
    Note.findOne({
        noteId: request.params.noteId,
        deleted: {$ne: true}
    }).lean().exec(function(error, note) {
        if(!error) {
            if(_.isNull(note)) {
                reply(Boom.notFound('Cannot find note with that noteId'));
            } else {
                reply(note);
            }
        } else {
            reply(Boom.notFound('Cannot find note with that noteId'));
        }
    })
}
};

module.exports.getAll = {
    tags: ['api'],
    description: '获取全部帖子',
    notes: '获得全部帖子信息',
    auth: false,
    handler: function(request, reply) {
        Note.find({ deleted: {$ne: true} }).lean().exec(function(error, notes) {
            if(!error) {
                if(_.isEmpty(notes)) {
                    reply(Boom.notFound('Cannot find any note'));
                } else {
                    reply(notes);
                }
            } else {
                reply(Boom.badImplementation('Unknown error has appears'));
            }
        });
    }
};

module.exports.remove = {
    tags: ['api'],
    description: '删除帖子',
    notes: '根据帖子id删除指定帖子',
    validate: {
        params: {
            noteId: Joi.string().regex(/[0-9]/)
        }
    },
    auth: {
        strategy: 'token',
        scope: ['admin']
    },
    handler: function(request, reply) {
        Note.findOne({
            noteId: request.params.noteId,
            scope: 'admin'
        }, function(error, note) {
            if(error) {
                return reply(Boom.badImplementation('Cannot remove Note'));
            } else if(_.isNull(note)) {
                return reply(Boom.notFound('Cannot find note with that ID'));
            } else if(!note.deleted) {
                note.softdelete(function (error, data) {
                    if (error) {
                        reply(Boom.badImplementation('Cannot remove Note'));
                    } else {
                        reply({code: 200, message: 'Note removed successfully'});
                    }
                });
            }
            else {
                reply({code: 200, message: 'Note has already removed'});
            }
        });
    }
};
