const Influx = require('influx');

const database = process.env.DB_NAME || 'drone';
const host = process.env.DB_HOST || 'db';

const measurement = 'commands';
const tags = ['drone'];

const db = new Influx.InfluxDB({
    database,
    host,
    schema: [
        {
            measurement,
            fields: {
                name: Influx.FieldType.STRING,
                x: Influx.FieldType.INTEGER,
                y: Influx.FieldType.INTEGER,
                direction: Influx.FieldType.INTEGER,
            },
            tags,
        },
    ],
});

async function init() {
    const names = await db.getDatabaseNames();
    if (!names.includes(database)) {
        await db.createDatabase(database);
    }
}

async function isExists(id) {
    const e = new Influx.Expression();
    e.tag('drone').equals.value(id);
    return db.query(`select * from ${measurement} where ${e.toString()}`);
}

async function save(id, action) {
    return db.writePoints([{
        measurement,
        tags: { drone: id },
        fields: action,
    }]);
}

async function get(id) {
    const e = new Influx.Expression();
    e.tag('drone').equals.value(id);
    return db.query(`select * from ${measurement} where ${e.toString()} order by time desc limit 1`);
}


module.exports = {
    init,
    save,
    isExists,
    get,
};
