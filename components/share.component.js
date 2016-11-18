'use strict';
const Joi = require('joi');
const cmsDB = require('../database').cmsDB;
const apiInfo = require('restfulapigenerator').apiInfo;
const  _ = require('lodash');
const Boom = require('boom');
var mongoose   = require('../database').mongoose;
var async = require('async');

module.exports = {

    info:{
        name:'share',
        version:'0.0.1'
    },

    db:cmsDB,

    Schema:{
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
                        id:       Joi.string(),
                        lastId:   Joi.string(),
                        pageSize: Joi.number().min(1).max(100).default(10)
                    }
                },

                response: {},

                handler:function (request,reply) {
                    var id = request.query.id.toObjectId();
                    var pageSize = request.query.pageSize || 5;

                    async.series([
                        function (callback) {
                            apiInfo.content.model
                                .find({deleted:false,status:'pushed',_id:id})
                                .sort({_id: 'desc'})
                                .select('title extensions _id date thumbnail')
                                .populate('thumbnail', '-_id fileOssName')
                                .limit(pageSize)
                                .lean()
                                .exec(function(err, data) {
                                    callback(err,data)
                                })
                        },
                        function (callback) {
                            apiInfo.feature.model
                                .find()
                                .limit(pageSize)
                                .select('sort title thumbnail extensions')
                                .populate('thumbnail', 'fileOssName -_id')
                                .sort({_id: 'desc'})
                                .lean()
                                .exec(function (err,data) {
                                    callback(err,data)
                                })
                        }
                    ],function (err,data) {
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

                },
            },
        }
    },



}