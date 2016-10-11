'use strict';

var NotesController = require('./notes.controller');

module.exports = [
    {   method: 'POST',   path: '/notes',   config: NotesController.create },
    {   method: 'GET',   path: '/notes/{noteId}',   config: NotesController.getOne },
    {   method: 'GET',   path: '/notes',   config: NotesController.getAll },
    {   method: 'DELETE',   path: '/notes/{noteId}',   config: NotesController.remove }
];
