var mainRoutes = require('./components/main/main.routes');
var usersRoutes = require('./components/users/users.routes');

module.exports = [].concat(mainRoutes, usersRoutes);