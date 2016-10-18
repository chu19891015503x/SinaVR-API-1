'use strict';

var NotesController = require('./notes.controller');

module.exports = [
    {   method: 'POST',   path: '/notes',   config: NotesController.create },
    {   method: 'GET',   path: '/notes/{noteId}',   config: NotesController.getOne },
    {   method: 'PUT',   path: '/notes/{noteId}',   config: NotesController.updateOne },
    {   method: 'GET',   path: '/notes',   config: NotesController.getAll },
    {   method: 'DELETE',   path: '/notes/{noteId}',   config: NotesController.remove }
];
