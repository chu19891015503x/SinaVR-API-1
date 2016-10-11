'use strict';

var database   = require('../../database')
var mongoose   = database.mongoose;
var sequence   = require('flocon')
var Schema     = mongoose.Schema;
var config     = require('../../config')
var softDelete = require('mongoose-softdelete');

var noteSchema = new Schema({
    noteId        : { type: Number, unique: true, required: true, default: -1 },
    title         : { type: String, required: true, trim: true },
    content       : { type: String, required: true, trim: true },
    scope         : { type: String, enum: config.scopes, default: config.scopes[0] },
    cover         : { type: String, required: true, trim: true },
    media         : { type: String, required: true, trim: true },
    createdAt     : { type: Date, default: Date.now }
});

noteSchema.plugin(softDelete);

noteSchema.pre('save', function(next) {
    var note = this;

    if(note.noteId == -1 ) {
        note.noteId = sequence.snow();
    }
    next();
});

var note = mongoose.model('Note', noteSchema);

module.exports = exports = note;
