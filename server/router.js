const router = require('express').Router();
const controller = require('./controllers');
const utils = require('./lib/utils');

const routes = [
    {
        path: '/api/drone/:id/actions/:action',
        method: 'GET',
        handler: controller.saveActions,
    },
    {
        path: '/api/drone/:id/status',
        method: 'GET',
        handler: controller.getActions,
    },
];

utils.setRoutes(router, routes);

module.exports = router;
