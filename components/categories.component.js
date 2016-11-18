/**
 * Created by fzt on 16/10/20.
 */

const Joi = require('joi');
const cmsDB = require('../database').cmsDB;
const apiInfo = require('restfulapigenerator').apiInfo;
const  _ = require('lodash');
const Boom = require('boom');

module.exports = {
    info: {
        name: 'categorie',
        version: '0.0.1'
    },

    db: cmsDB,

    Schema: {
        //_id         :{type:String,  required:true, trim:true, joi:Joi.string()},
        name: {type: String, required: true, trim: true, joi: Joi.string()}
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
            }
        },
        controllers: {
            getAll: {

                // validate:{
                //     params: {
                //         id: Joi.number().integer().required()
                //     }
                // },
                response: {},

                handler: function (request, reply) {
                    var pageSize = request.query.pageSize || 20;
                    var lastId = request.query.lastId || Number.MAX_VALUE;
                    apiInfo.categorie.model
                        .find({})
                        .select('name _id sort')
                        .limit(pageSize)
                        .sort({_id: 'desc'})
                        .lean()
                        .exec(function(err, data) {
                        if (!err) {
                            if(_.isEmpty(data)) {
                                reply(Boom.notFound('Cannot find any ' + singularRouteName));
                            } else {
                                reply(data);
                            }
                        } else {
                            reply(Boom.badImplementation(err)); // 500 error
                        }
                    })
                }
            },


        }
    }

}
