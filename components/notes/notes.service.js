'use strict';

var Boom = require('boom');
var Note = require('./note.model');
var _ = require('lodash');

module.exports.create = function(request, reply) {
    var note = new Note(request.payload);
    note.save(request.payload, function(error, note) {
        if(!error) {
            reply('Note created successfully, noteId: '+ note.noteId);
        } else {
            reply(Boom.badImplementation('Cannot create Note'));
        }
    });
};

module.exports.getOne = function(request, reply) {
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
    });
};

module.exports.getAll = function(request, reply) {
    var page = request.query.page || 1;
    var pageSize = request.query.pageSize || 10;
    var start = (page - 1) * pageSize;
    Note.find({ deleted: {$ne: true} }).skip(start).limit(pageSize).sort({createdAt:'desc'}).lean().exec(function(error, notes) {
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
};

module.exports.remove = function(request, reply) {
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
};
