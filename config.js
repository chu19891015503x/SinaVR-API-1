module.exports = {
    product: {
        name: 'SinaVR API'
    },
    server: {
        host: '127.0.0.1',
        port: 8080
    },
    database: {
        host: '127.0.0.1',
        port: 27017,
        db: 'SinaVR',
        username: '',
        password: ''
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