const _ = require('lodash');

const Actions = {
    PLACE: 'place',
    MOVE: 'move',
    LEFT: 'left',
    RIGHT: 'right',
};

module.exports = {
    Grid: {
        min: 0,
        max: 5,
    },
    Actions,
    ActionList: _.values(Actions),
};
