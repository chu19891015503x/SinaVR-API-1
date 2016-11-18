'use strict';

var Hapi = require('hapi');
var routes = require('./routes');
var config = require('./config');
var moment = require('moment');
var UsersService = require('./components/users/users.service');

const Chalk = require('chalk');

var server = new Hapi.Server();

const formatLogEvent = function (event) {
    if (event.tags.error) {
        console.log(`[${event.tags}], ${Chalk.red(event.data)}`);            
    } else {
        console.log(`[${event.tags}], ${Chalk.green(event.data)}`);               
    }
};
server.on('log', formatLogEvent);

server.connection(
    {
        port: config.server.port,
        host: config.server.host,
        routes: {
            cors: true
        }
    }
);

var plugins = [
    require('hapi-auth-jwt'),
    {
        'register': require('restfulapigenerator'),
        'options': {
            componentPath: __dirname + '/components/',
            db: require('./database').mainDB
        }
    },
    require('./server.filter')
];

if(process.env.NODE_ENV == "development") {
    plugins = plugins.concat([
        require('inert'),
        require('vision'),
        {
            'register': require('hapi-swagger'),
            'options': {
                info: {
                    'title': 'SinaVR API Documentation',
                    'version': require('./package').version,
                },
                securityDefinitions: {
                    'jwt': {
                        'type': 'apiKey',
                        'name': 'Authorization',
                        'in': 'header'
                    }
                },
                debug: true
            }
        }
    ]);
}

server.register(plugins, (err) => {
    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.auth.strategy('token', 'jwt', {
        key: config.token.privateKey,
        validateFunc: UsersService.validateToken
    });
    server.route(routes);

    server.start((err) => {
        if (err) {
            throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
    });

});
