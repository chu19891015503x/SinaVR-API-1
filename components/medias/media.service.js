'use strict';

var Boom = require('boom');
var Media = require('./media.model');
var _ = require('lodash');
var Jwt = require('jsonwebtoken');
var config = require('../../config');
var database   = require('../../database');


module.exports.getOne = function (request, reply) {
    var id = request.query.id.toObjectId();
    Media.findOne({
        _id: id
    }).select('fileOssName fileOssPath').lean().exec(function (error,media) {
       if(!error){
           if(_.isNull(media)){
               reply(Boom.notFound('Cannot find medias with that thumbnailId'));
           }else{
               reply(media);
           }

       }else{
           reply(Boom.notFound('Cannot find medias with that thumbnailId'));
       }

    })
}


