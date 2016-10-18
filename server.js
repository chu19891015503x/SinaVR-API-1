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

var apiBuilder = require('./apibuilder')
var Joi = require('joi');

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

var initServer = function () {
    server.auth.strategy('token', 'jwt', {
        key: config.token.privateKey,
        validateFunc: UsersService.validateToken
    });

    let accountSchema = {
        "userName"      : { type: String, required: true, unique: true, reply: false, trim: true, joi: Joi.string().email() },
        "password"      : { type: String, required: true, trim: true, reply: false, joi: Joi.string().regex(/^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,22}$/) },
        "tokens"        : { type: Array, validated: false, joi: Joi.array().items(Joi.object({token: Joi.string().regex(/[A-Za-z0-9]/), createdAt: Joi.date()})) }
    }

    let accountOptions = {
        routes: {
            getAll: {
                disable: true
            },
            getOne: {
                disable: true
            },
            update: {
                disable: true
            },
            create: {
                description: '创建token',
                notes: '根据用户名密码创建token'
            }
        },
        controllers: {
            create: {
                response: {
                    schema: {
                        token: Joi.string()
                    }
                },
                handler: function (request, reply) {
                    reply({token: 'fasdfsdf'});
                }
            }
        }
    }

    let gameSchema =  {
        title         : { type: String, required: true, trim: true, joi: Joi.string() },
        content       : { type: String, required: true, trim: true, joi: Joi.string() },
        cover         : { type: String, required: true, trim: true, joi: Joi.string().uri({scheme:/https?/}) },
        media         : { type: String, required: true, trim: true, joi: Joi.string().uri({scheme:/https?/}) }
    };

    var game = apiBuilder(gameSchema, 'games', 'Game', 'game', require('./database').mongoose);
    var account = apiBuilder(accountSchema, 'account', 'Account', 'account', require('./database').mongoose, accountOptions);

    server.route(routes.concat(game.routes, account.routes));
}

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
        initServer
    );
} else {
    server.register(
        [
            require('hapi-auth-jwt'),
        ],
        initServer
    );

}

serverFilter(server);

server.start(function() {
    console.log('Server running on port: ', server.info.uri)
});

