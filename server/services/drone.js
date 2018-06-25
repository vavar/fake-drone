const _ = require('lodash');
const debug = require('debug')('drone-save-action');

const constants = require('../lib/constants');

const {
    Actions,
    Grid,
} = constants;

function adjustFace(lastAction, newFace) {
    const { direction } = lastAction;
    const newDirection = (newFace === Actions.RIGHT) ? (direction + 1) % 4 : (4 + direction - 1) % 4;
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
    const { min, max } = Grid;
    if (!_.inRange(x, min, max) || !_.inRange(y, min, max)) {
        return null;
    }

    debug(`move to ${x},${y}`);
    return _.merge({}, lastAction, { x, y });
}

function processCommand(lastAction, currentAction) {
    if (!lastAction) {
        return currentAction;
    }
    const { name } = currentAction;
    let action;
    switch (name) {
        case Actions.PLACE:
            return currentAction;
        case Actions.MOVE:
            action = moveDrone(lastAction);
            break;
        default:
            action = adjustFace(lastAction, currentAction.name);
            break;
    }
    return action ? _.merge(action, { name }) : null;
}

module.exports = {
    processCommand,
};
