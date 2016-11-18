const Joi = require('joi');
const cmsDB = require('../database').cmsDB;
var crypto = require('crypto');
var signUrl = require('sign-url')

module.exports = {
    info:{
        name:'token',
        version:'0.0.1'
    },

    db:cmsDB,

    Schema: {
        token: {
            type: String,
            required: true,
        },
    },

    Options: {
        routes: {
            getAll: {
                disable: false
            },
            getOne: {
                disable: true
            },
            update: {
                disable: true
            },
            create: {
                disable: true
            },
            remove: {
                disable: true
            },
        },

        controllers:{
            getAll:{
                validate:{
                    query: {
                        deviceId: Joi.string(),
                        lastId:   Joi.string(),
                        pageSize: Joi.number().min(1).max(100).default(10)
                    }
                },

                response: {},

                handler:function (request,reply) {
                    var deviceId = request.query.deviceId;
                    var token = crypto.createHash('md5').update(deviceId).digest('hex');
                    // var url = "http://10.235.65.42:8080/categories?pageSize=20&deviceId=vivoX6Avivoimei860904035100199";
                    // var signUrlSignture = signUrl.signature(url,'9aad409dad673e13fbe67c8778a3b7f1');
                    // var signtureUrl = 'http://10.235.65.42:8080/categories?deviceId=vivoX6Avivoimei860904035100199&pageSize=20&signature=4KZlc%2Fv5kzFNJXVdwTcZ%2Fq5n1J4%3D';
                    // var result = signUrl.check(signtureUrl,'9aad409dad673e13fbe67c8778a3b7f1');
                    reply(token);
                }

            }
        }
    },



}