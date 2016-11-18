'use strict';

var mainRoutes = require('./components/main/main.routes');
var usersRoutes = require('./components/users/users.routes');
var notesRoutes = require('./components/notes/notes.routes');
var mediaRoutes = require('./components/medias/media.routes')

module.exports = [].concat(mainRoutes, usersRoutes, notesRoutes,mediaRoutes);
