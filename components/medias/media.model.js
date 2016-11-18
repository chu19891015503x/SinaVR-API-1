'use strict';

var mongoose   = require('../../database').mongoose;
const cmsDB = require('../../database').cmsDB;
var config     = require('../../config');
var bcrypt     = require('bcrypt');
var sequence   = require('flocon-new')
var _          = require('lodash');
var Schema     = mongoose.Schema;
var softDelete = require('mongoose-softdelete');

/**
 * 媒体模型
 */
var mediaSchema = Schema({
    // 媒体类型
    type: {
        type: String,
        required: true
    },

    // 文件名
    fileName: {
        type: String,
        required: true
    },

    // 描述
    description: String,

    // 上传日期
    date: {
        type: Date,
        default: Date.now
    },

    // 媒体大小
    size: {
        type: Number,
        required: true
    },
    // ALY Oss存文件名
    fileOssName: {
        type: String,
        required: true
    },
    // ALY Oss 访问地址
    fileOssPath: {
        type: String,
        required: true
    },
    //逻辑删除标识符 1正常 0 删除
    isDelete: {
        type: String,
        required: true
    },

    // 来源归属
    quotes: [mongoose.Schema.Types.ObjectId]
}, {
    collection: 'media',
    id: false
});
mediaSchema.plugin(softDelete);


var media = cmsDB.model('Media',mediaSchema);

module.exports = exports = media;