const _ = require('lodash');

function wrap(fn) {
    // async error-handling middleware
    if (fn.length === 4) {
        return (err, req, res, next) => fn(err, req, res, next).catch(next);
    }

    return (req, res, next) => fn(req, res, next).catch(next);
}

function wrapAll(fns) {
    return _.map(fns, fn => wrap(fn));
}

function setRoutes(router, routes) {
    routes.forEach((route) => {
        if (!route.handler && !route.proxyUrl) {
            return;
        }

        let args = [];
        if (route.middleware) {
            args.push(wrapAll(route.middleware));
        }

        if (route.handler) {
            args.push(wrap(route.handler));
        }

        args = _.flatten(args);
        router[route.method.toLowerCase()](route.path, ...args);
    });
}

module.exports = {
    setRoutes,
};
