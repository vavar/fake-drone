
const _ = require('lodash');
const HTTPStatus = require('http-status');
const debug = require('debug')('drone-save-action');

const db = require('../services/db');
const drone = require('../services/drone');

const {
    Actions,
    ActionList,
} = require('../lib/constants');


module.exports = async function saveActions(req, res) {
    const { id, action } = req.params;

    if (!_.includes(ActionList, action)) {
        res.status(HTTPStatus.BAD_REQUEST).end();
        return;
    }

    let lastAction;
    try {
        const actions = await db.get(id);
        lastAction = _.pick(actions[0], ['name', 'x', 'y', 'direction']);
        if (!lastAction && action !== Actions.PLACE) {
            res.status(HTTPStatus.BAD_REQUEST).end();
            return;
        }
    } catch (err) {
        debug('get action error', err);
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).end();
        return;
    }

    const currentAction = {
        name: action,
    };

    if (action === Actions.PLACE) {
        const { x, y, f } = req.query;
        currentAction.x = +x;
        currentAction.y = +y;
        currentAction.direction = +f;
    }

    const updateAction = drone.processCommand(lastAction, currentAction);
    if (!updateAction) {
        res.status(HTTPStatus.BAD_REQUEST).end();
        return;
    }

    try {
        debug('save action', updateAction);
        await db.save(id, updateAction);
    } catch (err) {
        debug('save action error', err);
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).end();
        return;
    }

    res.json(updateAction);
};
