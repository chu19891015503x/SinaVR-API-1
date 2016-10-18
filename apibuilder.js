'use strict';

var Joi = require('joi');
var Boom = require('boom');
var Hoek = require('hoek');
var _ = require('lodash');

var mongoose   = require('./database').mongoose;
var config     = require('./config');
var softDelete = require('mongoose-softdelete');
var sqeuenceId = require('./mongoose-sequenceid');

var Schema = mongoose.Schema;


function apiBuilder(schemaDefination, routeBaseName, modelName, singularRouteName, db, options){

    Hoek.assert(schemaDefination, 'Schema Defination is required');
    Hoek.assert(routeBaseName, 'Route Base Name is required');
    Hoek.assert(modelName, 'Model Name is required');
    Hoek.assert(singularRouteName, 'Singular Model\'s Route Name is required');

    var validations = {}
    var schema = null;
    var model = null;
    var controllers = {};
    var routes = [];

    validations = buildValidationObject(schemaDefination);
    schema = buildSchema(validations.schema, validations.reply);
    model = buildModel(modelName, schema, db);
    controllers = buildControllers(model, validations, singularRouteName, options);
    routes = buildRoutes(controllers, routeBaseName, singularRouteName, options);

    return {
        validations: {
            post: validations.post,
            put: validations.put
        },
        schema: schema,
        model: model,
        controllers: controllers,
        routes: routes
    }
}

function buildValidationObject(config){
    var post = {}, put = {}, reply = { id: Joi.number().integer() };
    var schema = Object.assign({}, config);
    for (var prop in schema) {
        var itemConf = schema[prop];
        if (itemConf === null) {
            throw new Error('Null configs are not supported!');
        }
        if (itemConf.joi) {
            if (!itemConf.joi.isJoi) {
                itemConf.joi = Joi.object(itemConf.joi);
            }
            if(itemConf.validated != false) {
                put[prop] = itemConf.joi;
                if (itemConf.required) {
                    post[prop] = itemConf.joi.required()
                } else {
                    post[prop] = itemConf.joi;
                }
            }
            if(itemConf.reply != false)
                reply[prop] = itemConf.joi;
            delete schema[prop].joi;
        }
    }
    return {
        schema: schema,
        post: post,
        put: put,
        reply: reply
    }
}

function getOptions(from, method, type, item, options) {
    if(options == undefined)
        return null;

    if(eval('options.'+from) == undefined)
        return null;
    if(eval('options.'+from+'.'+method) == undefined)
        return null;
    var result = eval('options.'+from+'.'+method+'.'+item);
    if(typeof result != type)
        return null;
    return result;
}

function getHandlerFromOptions(method, options) {
    return getOptions('controllers', method, 'function', 'handler', options);
}

function getValidateFromOptions(method, options) {
    return getOptions('controllers', method, 'object', 'validate', options);
}

function getResponseFromOptions(method, options) {
    return getOptions('controllers', method, 'object', 'response', options);
}

function getDescriptionFromOptions(method, options) {
    return getOptions('routes', method, 'string', 'description', options);
}

function getNotesFromOptions(method, options) {
    return getOptions('routes', method, 'string', 'notes', options);
}

function getRouteDisableFromOptions(method, options) {
    return getOptions('routes', method, 'boolean', 'disable', options);
}

function buildControllers(model, joiValidationObject, singularRouteName, options){
    var controllers = {
        getAll: {
            validate: getValidateFromOptions('getAll', options) || {
                query: {
                    lastId: Joi.number().integer().description('The last id, from lastest ' + singularRouteName + ' with an unspecified value'),
                    pageSize: Joi.number().integer().min(1).max(100).default(20).
                    description('The number of ' + singularRouteName + ' per pages(1-100), default value is 20')
                }
            },
            response: getResponseFromOptions('getAll', options) || {
                sample: 50,
                schema: Joi.array().items(joiValidationObject.reply)
            },
            handler: getHandlerFromOptions('getAll', options) || function(request, reply) {
                var pageSize = request.query.pageSize || 20;
                var lastId = request.query.lastId || Number.MAX_VALUE;
                model.findAll(lastId, pageSize, function(err, data) {
                    if (!err) {
                        if(_.isEmpty(data)) {
                            reply(Boom.notFound('Cannot find any ' + singularRouteName));
                        } else {
                            reply(data);
                        }
                    } else {
                        reply(Boom.badImplementation(err)); // 500 error
                    }
                });
            }
        },
        getOne: {
            validate: getValidateFromOptions('getOne', options) || {
                params: {
                    id: Joi.number().integer().required()
                }
            },
            response: getResponseFromOptions('getOne', options) || {
                schema: joiValidationObject.reply
            },
            handler: getHandlerFromOptions('getOne', options) || function(request, reply) {
                model.findByIdLean(request.params.id,
                    function (err, data) {
                        if (!err) {
                            if(_.isNull(data)) {
                                reply(Boom.notFound('Cannot find ' + singularRouteName + ' with that id'));
                            } else {
                                reply(data);
                            }
                        } else {
                            reply(Boom.notFound(err)); // 500 error
                        }
                    }
                );
            }
        },
        create: {
            validate: getValidateFromOptions('create', options) || {
                payload: joiValidationObject.post
            },
            response: getResponseFromOptions('create', options) || {
            },
            handler: getHandlerFromOptions('create', options) || function(request, reply) {
                var payload = request.payload;
                var object = new model(payload);
                object.save(function(err, data) {
                    if (!err) {
                        reply({ id: data.id }).created('/' + data.id); // HTTP 201
                    } else {
                        if (11000 === err.code || 11001 === err.code) {
                            reply(Boom.forbidden('please provide another ' + singularRouteName + ' id, it already exist'));
                        } else {
                            reply(Boom.forbidden(getErrorMessageFrom(err))); // HTTP 403
                        }
                    }
                });
            }
        },
        update: {
            validate: getValidateFromOptions('update', options) || {
                params: {
                    id: Joi.number().integer().required()
                },
                payload: joiValidationObject.put
            },
            response: getResponseFromOptions('update', options) || {
            },
            handler: getHandlerFromOptions('update', options) || function(request, reply) {
                model.findByIdAndUpdate(request.params.id, request.payload, function(error, data) {
                    if(!error) {
                        if(_.isNull(data)) {
                            reply(Boom.notFound('Cannot find ' + singularRouteName + ' with that id'));
                        } else {
                            reply({ id: data.id }).updated('/' + data.id); // HTTP 201;
                        }
                    } else {
                        reply(Boom.notFound('Cannot find ' + singularRouteName + ' with that noteId'));
                    }
                });
            }
        },
        remove: {
            validate: getValidateFromOptions('remove', options) || {
                params: {
                    id: Joi.number().integer().required()
                }
            },
            response: getResponseFromOptions('remove', options) || {
            },
            handler: getHandlerFromOptions('remove', options) || function(request, reply) {
                model.findById(request.params.id,
                    function (error, data) {
                        if (error) {
                            return reply(Boom.badImplementation('Could not delete ' + singularRouteName));
                        } else if (_.isNull(data)) {
                            return reply(Boom.notFound('Cannot find ' + singularRouteName + ' with that id'));
                        } else if (!data.deleted) {
                            data.softdelete(function (error, data) {
                                if (error) {
                                    reply(Boom.badImplementation('Could not delete ' + singularRouteName));
                                } else {
                                    reply({code: 200, message: singularRouteName + ' removed successfully'});
                                }
                            });
                        }
                        else {
                            reply({code: 201, message: singularRouteName + ' has already removed'});
                        }
                    }
                );
            }
        }
    };
    return controllers;
}


function buildRoutes(controllers, routeBaseName, singularRouteName, options){
    var routes = [];
    if(!getRouteDisableFromOptions('getAll', options)) {
        routes.push({
            method : 'GET',
            path : '/' + routeBaseName,
            config: {
                validate: controllers.getAll.validate,
                response: controllers.getAll.response,
                description: getDescriptionFromOptions('getAll', options) || 'Get all ' + routeBaseName + '',
                notes: getNotesFromOptions('getAll', options) || 'Returns a list of ' + routeBaseName + ' ordered by addition date',
                tags: ['api', routeBaseName],
            },
            handler : controllers.getAll.handler
        });
    }
    if(!getRouteDisableFromOptions('getOne', options)) {
        routes.push({
            method : 'GET',
            path : '/' + routeBaseName + '/{id}',
            config: {
                validate: controllers.getOne.validate,
                response: controllers.getOne.response,
                description: getDescriptionFromOptions('getAll', options) || 'Get ' + singularRouteName + ' by DB Id',
                notes: getNotesFromOptions('getAll', options) || 'Returns the ' + singularRouteName + ' object if matched with the DB id',
                tags: ['api', routeBaseName],
            },
            handler : controllers.getOne.handler
        });
    }
    if(!getRouteDisableFromOptions('update', options)) {
        routes.push({
            method : 'PUT',
            path : '/' + routeBaseName + '/{id}',
            config: {
                validate: controllers.update.validate,
                response: controllers.update.response,
                description: getDescriptionFromOptions('update', options) || 'Update a ' + singularRouteName,
                notes: getNotesFromOptions('update', options) ||  'Returns a ' + singularRouteName + ' by the id passed in the path',
                tags: ['api', routeBaseName],
            },
            handler : controllers.update.handler
        });
    }
    if(!getRouteDisableFromOptions('remove', options)) {
        routes.push({
            method: 'DELETE',
            path: '/' + routeBaseName + '/{id}',
            config: {
                validate: controllers.remove.validate,
                response: controllers.remove.response,
                description: getDescriptionFromOptions('remove', options) || 'Delete ' + singularRouteName,
                notes: getNotesFromOptions('remove', options) || 'Returns the ' + singularRouteName + ' deletion status',
                tags: ['api', routeBaseName],
            },
            handler: controllers.remove.handler
        });
    }
    if(!getRouteDisableFromOptions('create', options)) {
        routes.push({
            method : 'POST',
            path : '/' + routeBaseName,
            config: {
                validate: controllers.create.validate,
                response: controllers.create.response,
                description: getDescriptionFromOptions('create', options) || 'Add a ' + singularRouteName,
                notes: getNotesFromOptions('create', options) || 'Returns a ' + singularRouteName + ' by the id passed in the path',
                tags: ['api', routeBaseName],
            },
            handler : controllers.create.handler
        });
    }
    return routes;
}

function buildModel(modelName, schema, db){
    if( db === undefined ){
        db = Mongoose;
    }
    return db.model(modelName, schema);
}

function buildSchema(definitionObject, schemaReply){
    var schema = new Schema(definitionObject);
    schema.plugin(softDelete);
    schema.plugin(sqeuenceId);

    var filter = '-_id';
    for(var prop in schemaReply) {
        filter += ' ' + prop;
    }

    schema.statics.findAll = function(lastId, pageSize, callback) {
        this.find(
            {
                id: {$lt: lastId},
                deleted: {$ne: true}
            }
        ).select(filter).limit(pageSize).sort({id: 'desc'}).lean().exec(callback);
    };
    schema.statics.findById = function(id, callback) {
        this.findOne(
            {
                id: id,
                deleted: {$ne: true}
            }
        ).exec(callback);
    };
    schema.statics.findByIdLean = function(id, callback) {
        this.findOne(
            {
                id: id,
                deleted: {$ne: true}
            }
        ).select(filter).lean().exec(callback);
    };
    schema.statics.findByIdAndUpdate = function(id, payload, callback) {
        this.findOneAndUpdate(
            {
                id: id,
                deleted: {$ne: true}
            },
            payload,
            {new: true} // 为真返回更新之后的内容
        ).select(filter).lean().exec(callback);
    };

    return schema;
}

function getErrorMessageFrom(err) {
    var errorMessage = '';

    if (err.errors) {
        for (var prop in err.errors) {
            if (err.errors.hasOwnProperty(prop)) {
                errorMessage += err.errors[prop].message + ' '
            }
        }

    } else {
        errorMessage = err.message;
    }

    return errorMessage;
}

module.exports = apiBuilder;
