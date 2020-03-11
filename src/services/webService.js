'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const configKeys = require('./config/configKeys');

let log, app, notification, config;
let routes = [
    ['/', 'homeController']
];

function setRoutes() {
    app.use(bodyParser.json());
    app.use((req, res, next) => {
        if (req.url === '/js/serviceWorker.js') {
            res.append('Service-Worker-Allowed', '/');
        }
        next();
    });
    app.use(express.static(path.join(__dirname, '..', 'assets')));
    app.set('views', path.join(__dirname, '..', 'views'));
    app.set('view engine', 'hjs');
    app.set('layout', 'layout');
    app.set('partials', {
        loading: 'shared/loading'
    });
    app.engine('hjs', require('hogan-express'));
    app.post('/subscribe', (req, res) => {
        const subscription = req.body;
        res.status(201).json({});
        const payload = JSON.stringify({ title: 'Notification Test' });      
        webpush.sendNotification(subscription, payload).catch(error => {
            console.error(error.stack);
        });
    });
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
        notification = root.notification;
    }

    async start() {
        const port = parseInt(process.env.PORT ? process.env.PORT : await config.get(configKeys.web.port));
        log.info('Starting web service...');
        log.info('Passing to Notification Service to start...');
        app = await notification.start();
        setRoutes();
        app.listen(port, () => {
            log.info(`Successfully started web service! Listening on port ${port}.`);
        });
    }
}

module.exports = WebService;