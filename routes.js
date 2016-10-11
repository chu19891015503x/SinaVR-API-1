'use strict';

var mainRoutes = require('./components/main/main.routes');
var usersRoutes = require('./components/users/users.routes');
var notesRoutes = require('./components/notes/notes.routes');

module.exports = [].concat(mainRoutes, usersRoutes, notesRoutes);
