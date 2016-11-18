
var MediaController = require('./media.controller');

module.exports = [
    {   method: 'GET',   path: '/medias',   config: MediaController.getOne}
]