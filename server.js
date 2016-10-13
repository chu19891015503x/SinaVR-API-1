'use strict';

var Hapi = require('hapi');
var routes = require('./routes');
var config = require('./config');
var db = require('./database');
//var jwt = require('jsonwebtoken');
var moment = require('moment');
var UsersService = require('./components/users/users.service');
var _ = require('lodash');
var serverFilter = require('./server.filter')

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


if(process.env.NODE_ENV == "development") {
    const Pack = require('./package')
    const options = {
        info: {
            'title': 'SinaVR API Documentation',
            'version': Pack.version,
        },
        securityDefinitions: {
            'jwt': {
                'type': 'apiKey',
                'name': 'Authorization',
                'in': 'header'
            }
        },
        debug: true
    };

    server.register(
        [
            require('hapi-auth-jwt'),
            require('inert'),
            require('vision'),
            {
                'register': require('hapi-swagger'),
                'options': options
            }
        ],
        function (error) {
            server.auth.strategy('token', 'jwt', {
                key: config.token.privateKey,
                validateFunc: UsersService.validateToken
            });
            server.route(routes);
        }
    );
} else {
    server.register(
        [
            require('hapi-auth-jwt'),
        ],
        function (error) {
            server.auth.strategy('token', 'jwt', {
                key: config.token.privateKey,
                validateFunc: UsersService.validateToken
            });
            server.route(routes);
        }
    );

}

serverFilter(server);

server.start(function() {
    console.log('Server running on port: ', server.info.uri)
});

