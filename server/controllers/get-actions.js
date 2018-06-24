const db = require('../services/db');

module.exports = async function getActions(req, res) {
    const { id } = req.params;
    const results = await db.get(id);
    res.json(results);
};
