var path = require('path');
var _ = require('lodash');
var apiBuilder = require('./apibuilder')
var requireAll = require('require-all');

var globalApiInfo = {};

module.exports = function (server, componentPath, db) {
    requireAll({
        dirname: path.join(__dirname, './'+componentPath+'/'),
        filter: /(.+component)\.js$/,
        recursive: true,
        resolve: function(component) {
            var api = apiBuilder(
                component.Schema,
                component.info.name.toLowerCase()+'s',
                component.info.name,
                component.info.name.toLowerCase(),
                db,
                component.Options
            );

            server.route(api.routes);

            globalApiInfo[component.info.name] = api;
        }
    });
}

module.exports.apiInfo = globalApiInfo;