'use strict';

const express = require('express');
const configKeys = require('./config/configKeys');

let log, app, config;
let routes = [
    ['/', 'homeController']
];

function setRoutes() {
    app.use(express.static(process.cwd() + '/assets'));
    app.set('view engine', 'hjs');
    app.set('layout', 'layout');
    app.set('partials', {
        loading: 'shared/loading'
    });
    app.engine('hjs', require('hogan-express'));

    routes.forEach(pair => {
        const routePath = pair[0];
        const controllerName = pair[1];
        try {
            const Controller = require(`../controllers/${controllerName}`);
            app.get(routePath, function(req, res) {
                new Controller().run(req, res);
            });
        }
        catch (ex) {
            log.error(`Failed to bind route "${routePath}" to controller "${controllerName}"! Error: ${ex}`);
        }
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
        app.listen(port, () => {
            log.info(`Successfully started web service! Listening on port ${port}.`);
        });
    }
}

module.exports = WebService;