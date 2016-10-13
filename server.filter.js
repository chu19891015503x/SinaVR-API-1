'use strict';

var signUrl = require('sign-url')
var config = require('./config');
var logs = require('./logs');

var httpLogger = logs.getLogger('http');
var errorLogger = logs.getLogger('error');

module.exports = function (server) {
    server.ext({
        type: 'onRequest',
        method: function (request, reply) {
            const url = `${request.headers['x-forwarded-proto'] || request.connection.info.protocol}://${request.info.host}${request.url.path}`;
            console.log(request.method + ' ' + url);

            var httpInfo = {
                method  : request.method,
                path    : request.url.pathname,
                url     : url,
                remote  : request.info.remoteAddress,
                agent   : request.headers['user-agent']
            };
            httpLogger.info(httpInfo);

            const route = server.match(request.method, request.url.pathname);
            if(!route.settings.auth) {
                return reply.continue();
            }

            var timestamp = request.query.expiry || 0;
            if(timestamp > (Date.now() + 30000) || timestamp < (Date.now() - 30000)) {
                httpInfo['msg'] = '请求已过期';
                errorLogger.error(httpInfo);
                return reply('请求已过期');
            }

            // http://my.superproject.io?confirm=username@somewhere.com&expiry=1392305771282&signature=SrO0X9p27LHFIe7xITBOpetZSpM%3D
            if(!signUrl.check(url, config.token.privateKey)) {
                httpInfo['msg'] = '签名验证失败';
                errorLogger.error(httpInfo);
                return reply('签名验证失败');
            }

            return reply.continue();
        }
    });
}