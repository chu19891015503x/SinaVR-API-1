'use strict';

var config = require('./config');
var mongoose = require('mongoose');
var Redis = require('ioredis');
var redisClient = new Redis(config.redis.port, config.redis.host);
var MongooseRedis = require('mongoose-with-redis');


mongoose.connect('mongodb://'+config.database.host+'/'+config.database.db);

mongoose.Promise = require('bluebird');

MongooseRedis(mongoose, redisClient, config.cacheOptions);

var db = mongoose.connection;
db.on('error', function() {
    console.error.bind(console, 'connection error');
});
db.once('open', function callback() {
    console.log('Connection with database succeeded');
});

module.exports.mongoose = mongoose;
module.exports.db = db;
