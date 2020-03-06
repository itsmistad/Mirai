'use strict';

const path = require('path');
const express = require('express');
const configKeys = require('./config/configKeys');

let log, app, config, root, controllers = [];
let routes = [
//  ['/route/to/page', '<page>Controller', 'GET' or 'POST']
    ['/', 'homeController', 'GET']
];

function setRoutes() {
    app.use('/js', express.static(path.join(__dirname, '..', 'dist/assets/js')));
    app.use('/css', express.static(path.join(__dirname, '..', 'dist/assets/css')));
    app.use('/files', express.static(path.join(__dirname, '..', 'dist/assets/files')));
    app.set('views', path.join(__dirname, '..', 'dist/views'));
    app.set('view engine', 'hjs');
    app.set('layout', 'shared/layout');
    app.set('partials', {
        loading: 'shared/loading',
        header: 'shared/header',
        footer: 'shared/footer'
    });
    app.engine('hjs', require('hogan-express'));

    routes.forEach(entry => {
        const routePath = entry[0];
        const splitRoute = routePath.split('/');
        const route = splitRoute[splitRoute.length - 1];
        const controllerName = entry[1];
        const requestType = entry[2];
        try {
            let controller = controllers.find(_ => _.constructor.name === controllerName);
            if (!controller) {
                const Controller = require(`../controllers/${controllerName}`);
                controller = new Controller(root);
                controllers.push(controller);
            }
            switch (requestType) {
            case 'POST':
                app.post(routePath, function(req, res) {
                    controller.run(route, req, res);
                });
                break;
            case 'GET':
                app.get(routePath, function(req, res) {
                    controller.run(route, req, res);
                });
                break;
            }
        }
        catch (ex) {
            log.error(`Failed to bind route "${routePath}" to controller "${controllerName}"! Error: ${ex}`);
        }
    });
}

class WebService {
    constructor(_root) {
        log = _root.log;
        config = _root.config;
        root = _root;
    }

    async start() {
        const port = parseInt(process.env.PORT || await config.get(configKeys.web.port));
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