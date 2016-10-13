'use strict';

var config = require('./config');
var log4js = require('log4js');

log4js.configure({
    appenders: [
        // {
        //     type: 'console'
        // },
        {
            type: 'log4js-node-mongodb',
            connectionString: config.log.host + ':' + config.log.port + '/' + config.log.db,
            category: 'http'
        },
        {
            type: 'log4js-node-mongodb',
            connectionString: config.log.host + ':' + config.log.port + '/' + config.log.db,
            category: 'warning'
        },
        {
            type: 'log4js-node-mongodb',
            connectionString: config.log.host + ':' + config.log.port + '/' + config.log.db,
            category: 'error'
        }
    ]
});

module.exports = log4js;