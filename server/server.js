const cluster = require('cluster');
const debug = require('debug');
const http = require('http');

const app = require('./app');
const db = require('./services/db');

const numCPUs = (process.env.NODE_ENV === 'production') ? require('os').cpus().length : 1;


if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    db.init().then(() => {
        // Workers can share any TCP connection
        // In this case it is an HTTP server
        const port = process.env.PORT || '3000';
        app.set('port', port);

        const server = http.createServer(app);

        // @ts-ignore: TS is expecting a callback but it doesn't seem to matter
        server.listen(port, '0.0.0.0');

        server.on('listening', () => {
            debug(`Server listening on port: ${port}`);
        });

        server.on('error', (error) => {
            debug(error);
            // @ts-ignore: Apparently error.code doesn't always exist
            debug(`Failed to start server on port: ${port}, error code: ${error.code}`);
            process.exit(1);
        });
        console.log(`Worker ${process.pid} started`);
    }).catch(console.log);
}