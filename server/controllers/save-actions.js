
const _ = require('lodash');
const HTTPStatus = require('http-status');
const debug = require('debug')('drone-save-action');
const db = require('../services/db');

const GRID_MIN = 0;
const GRID_MAX = 5;

const DIRECTION = {
    north: 0,
    east: 1,
    south: 2,
    west: 3,
};

const ACTION_PLACE = 'place';
const ACTION_MOVE = 'move';
const ACTION_LEFT = 'left';
const ACTION_RIGHT = 'right';

const ACTION_LIST = [ACTION_PLACE, ACTION_MOVE, ACTION_LEFT, ACTION_RIGHT];

function adjustFace(lastAction, newFace) {
    const { direction } = lastAction;
    const newDirection = (newFace === ACTION_RIGHT) ? (direction + 1) % 4 : (4 + direction - 1) % 4;
    return _.merge({}, lastAction, { direction: newDirection });
}

function moveDrone(lastAction) {
    const { direction } = lastAction;
    let { x, y } = lastAction;
    if (direction === 0) {
        y += 1;
    } else if (direction === 1) {
        x += 1;
    } else if (direction === 2) {
        y -= 1;
    } else {
        x -= 1;
    }

    if (!_.inRange(x, GRID_MIN, GRID_MAX) || !_.inRange(y, GRID_MIN, GRID_MAX)) {
        return null;
    }

    console.log(`move to ${x},${y}`);
    return _.merge({}, lastAction, { x, y });
}

function updatePosition(lastAction, currentAction) {
    if (!lastAction) {
        return currentAction;
    }
    const { name } = currentAction;
    let action;
    switch (name) {
        case ACTION_PLACE:
            return currentAction;
        case ACTION_MOVE:
            action = moveDrone(lastAction);
            break;
        default:
            action = adjustFace(lastAction, currentAction.name);
            break;
    }
    return action ? _.merge(action, { name }) : null;
}

module.exports = async function saveActions(req, res) {
    const { id, action } = req.params;

    if (!_.includes(ACTION_LIST, action)) {
        res.status(HTTPStatus.BAD_REQUEST).end();
    }

    const [lastAction] = await db.get(id);
    if (!lastAction && action !== ACTION_PLACE) {
        res.status(HTTPStatus.BAD_REQUEST).end();
    }

    const currentAction = {
        name: action,
    };

    if (action === ACTION_PLACE) {
        const { x, y, f } = req.query;
        currentAction.x = +x;
        currentAction.y = +y;
        currentAction.direction = DIRECTION[f];
    }

    const updateAction = updatePosition(_.pick(lastAction, ['name', 'x', 'y', 'direction']), currentAction);
    if (!updateAction) {
        res.status(HTTPStatus.BAD_REQUEST).end();
        return;
    }

    try {
        console.log('save action', updateAction);
        await db.save(id, updateAction);
    } catch (err) {
        debug('save action error', err);
    }

    res.json(updateAction);
};
