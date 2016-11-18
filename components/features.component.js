/**
 * Created by fzt on 16/11/2.
 */
'use strict';
const Joi = require('joi');
const cmsDB = require('../database').cmsDB;
const apiInfo = require('restfulapigenerator').apiInfo;
const  _ = require('lodash');
const Boom = require('boom');
var mongoose   = require('../database').mongoose;

module.exports = {
    info:{
        name:'feature',
        version:'0.0.1'
    },

    db:cmsDB,

    Schema: {
        title: {
            type: String,
            required: true,
        },
        //缩略图
        thumbnail: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Media'
        },
        extensions: {
            videoList: {
                type: String,
                trim: true,
                joi: Joi.string()
            },
            playCount: {
                type: String,
                required: true,
                trim: true,
                joi: Joi.string()
            },
            vrImageList: {
                type: String,
                trim: true,
                joi: Joi.string()
            },
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
                        lastId:   Joi.string(),
                        pageSize: Joi.number().min(1).max(100).default(10)
                    }
                },

                response: {},

                handler:function (request,reply) {
                    var pageSize = request.query.pageSize || 5;
                    apiInfo.feature.model
                        .find()
                        .limit(pageSize)
                        .select('sort title thumbnail extensions')
                        .populate('thumbnail', 'fileOssName -_id')
                        .sort({_id: 'desc'})
                        .lean()
                        .exec(function (err,data) {
                            if(!err){
                                if(_.isEmpty(data)){
                                    reply(Boom.notFound('Cannot find any feature'));
                                }else{
                                    reply(data);
                                }
                            }else{
                                reply(Boom.badImplementation('Cannot find any feature')); // 500 error
                            }
                        })

                }

            }
        }
    },



}