/**
 * Created by fzt on 16/10/20.
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
        name:'content',
        version:'0.0.1'
    },

    db: cmsDB,

    Schema: {
        title: {
            type:String,
            required: true, //是否必需返回
            trim:true,      //去除空格
            joi: Joi.string()
        },

        //缩略图
        thumbnail: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Media'
        },

        extensions: {
            videoList: {
                type:String,
                trim:true,
                joi: Joi.string()
            },
            playCount: {
                type: String,
                required: true,
                trim: true,
                joi: Joi.string()},
            vrImageList : {
                type: String,
                trim: true,
                joi: Joi.string()
            },
        }
    },

    Options: {
        routes: {
            getAll: {
                disable: false
            },
            getOne: {
                disable: false
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
        controllers: {
            getAll: {

                validate:{
                    query: {
                        categorie:Joi.string(),
                        lastId:   Joi.string(),
                        pageSize: Joi.number().min(1).max(100).default(10)
                    }
                },

                response: {},

                handler: function (request, reply) {
                    var start = request.query.lastId || 0;
                    if(start == 0){
                        start = 'ffffffffffffffffffffffff'.toObjectId();
                    }else{
                        start = start.toObjectId();
                    }

                    var pageSize = request.query.pageSize || 10;
                    var category = request.query.categorie.toObjectId();

                    apiInfo.content.model
                        .find({category:category,deleted:false,status:'pushed',_id:{$lt:start}})
                        .sort({_id: 'desc'})
                        .select('title extensions _id date thumbnail')
                        .populate('thumbnail', '-_id fileOssName')
                        .limit(pageSize)
                        .lean()
                        .exec(function(err, data) {
                            if (!err) {
                                if(_.isEmpty(data)) {
                                    reply(Boom.notFound('Cannot find any content'));
                                } else {
                                    reply(data);
                                }
                            } else {
                                reply(Boom.badImplementation(err)); // 500 error
                            }
                        })
                }
            },

            getOne:{
                validate:{
                    query: {
                        keyword :  Joi.string(),
                        lastId  :  Joi.string(),
                        pageSize:  Joi.number().min(1).max(100).default(10)
                    }
                },

                response: {},

                handler:function (request,reply) {
                    var start = request.query.lastId || 0;
                    if(start == 0){
                        start = 'ffffffffffffffffffffffff'.toObjectId();
                    }else{
                        start = start.toObjectId();
                    }
                    var pageSize = request.query.pageSize || 20;
                    var keyword = request.query.keyword;
                    apiInfo.content.model
                        .find({title:{$regex: keyword, $options:'i'},deleted:false,status:'pushed',_id:{$lt:start}})
                        .sort({_id: 'desc'})
                        .select('title extensions _id date thumbnail')
                        .populate('thumbnail', 'fileOssName')
                        .limit(pageSize)
                        .lean()
                        .exec(function(err, data) {
                            if (!err) {
                                if(_.isEmpty(data)) {
                                    reply(Boom.notFound('Cannot find any content'));
                                } else {
                                    reply(data);
                                }
                            } else {
                                reply(Boom.badImplementation(err)); // 500 error
                            }
                        })
                }

            }

        }
    },





}