var Joi = require('joi');
var config = require('../../config');
var _ = require('lodash');
var moment = require('moment');
var MediaService = require('./media.service')

module.exports.getOne = {
    tags: ['api'],
    auth: false,
    validate:{
        query: {
            id: Joi.string(),
            lastId:   Joi.string(),
            pageSize: Joi.number().min(1).max(100).default(10)
        }
    },
    handler:MediaService.getOne

}