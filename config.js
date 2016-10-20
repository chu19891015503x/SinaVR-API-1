'use strict';

module.exports = {
    product: {
        name: 'SinaVR API'
    },
    server: {
        host: 'localhost',
        port: 8080
    },
    database: {
        host: '127.0.0.1',
        port: 27017,
        db: 'SinaVR',
        username: 'SinaVR',
        password: 'h9dixwi4yrNHH8N5'
    },
    cms: {
        host: '127.0.0.1',
        port: 27017,
        db: 'nodercms',
        username: 'nodercms',
        password: 'nodercms'
    },
    log: {
        host: '127.0.0.1',
        port: 27017,
        db: 'logs',
        username: 'logs',
        password: 'uJvBR1SYSEfSmu4u'
    },
    cacheOptions: {
        cache: true,
        expires: 60,
        prefix: 'RedisCache'
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    scopes: [
        'admin',
        'user'
    ],
    security: {
        workFactor: 11
    },
    token: {
        privateKey: 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc',
        tokenExpire: 60*60*24 // 1 day
    }
};

// trick to allow convert sting into mongoose ObjectId
String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};
