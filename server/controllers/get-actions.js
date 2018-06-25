const _ = require('lodash');
const HTTPStatus = require('http-status');
const db = require('../services/db');

module.exports = async function getActions(req, res) {
    const { id } = req.params;
    try {
        const [result] = await db.get(id);
        res.json(_.pick(result, ['name', 'x', 'y', 'direction']));
    } catch (err) {
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).end();
    }
};
