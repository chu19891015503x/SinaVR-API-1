const Joi = require('joi');
const mainDB = require('../database').mainDB;

module.exports = {
    info: {
        name: 'Game',
        version: '0.0.1'
    },
    db: mainDB,
    Schema: {
        title         : { type: String, required: true, trim: true, joi: Joi.string() },
        content       : { type: String, required: true, trim: true, joi: Joi.string() },
        cover         : { type: String, required: true, trim: true, joi: Joi.string().uri({scheme:/https?/}) },
        media         : { type: String, required: true, trim: true, joi: Joi.string().uri({scheme:/https?/}) }
    }
}
