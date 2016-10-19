'use strict';

var sequence   = require('flocon-new')

module.exports = function(schema) {
    schema.add({ id: { type: Number, index: true, unique: true, default: -1 } });
    schema.add({ createdAt: { type: Date, default: Date.now } });


    schema.pre('save', function (next) {
        if(this.isNew && this.id == -1 ) {
            this.id = sequence.snow();
        }
        next();
    });

    schema.methods.generateId = function() {
        this.id = sequence.snow();
    };
};
