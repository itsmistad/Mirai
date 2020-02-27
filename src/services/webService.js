'use strict';

const express = require('express');
const configKeys = require('./config/configKeys');
const path = require('path');

let log, app, config, server;

let routes = [
    ['/', 'homeController']
];

function setRoutes() {
    routes.forEach(pair => {
        const route = pair[0];
        const controller = pair[1];
        app.get(route, (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'index.html'));
        });
    });
}

class WebService {
    constructor(root) {
        log = root.log;
        config = root.config;
    }

    async start() {
        const port = parseInt(await config.get(configKeys.web.port));
        log.debug(`Port retrieved from configuration: ${port}`);

        log.info('Starting web service...');
        app = express();
        setRoutes();
        server = app.listen(port, () => {
            log.info(`Successfully started web service! Listening on port ${port}.s`);
        });
    }
}

module.exports = WebService;