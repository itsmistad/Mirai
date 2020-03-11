'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const configKeys = require('./config/configKeys');

let log, app, config;

class NotificationService {
    constructor(root) {
        log = root.log;
        config = root.config;
    }

    async start() {
        log.info('Starting Notification Service');
        const notif_email = await config.get(configKeys.notifications.email);
        log.debug(`Notification Contact retrieved from configuration: ${notif_email}`);
        const notif_public_key = await config.get(configKeys.notifications.public_key);
        log.debug(`Notification public key retrieved from configuration: ${notif_public_key}`);
        const notif_private_key = await config.get(configKeys.notifications.private_key);
        log.debug(`Notification private key retrieved from configuration: ${notif_private_key}`);
        webpush.setVapidDetails(notif_email,notif_public_key,notif_private_key);
        app = express();
        app.use(bodyParser.json());
        app.use((req, res, next) => {
            if (req.url === '/js/serviceWorker.js') {
                res.append('Service-Worker-Allowed', '/');
            }
            next();
        });
        app.post('/subscribe', (req, res) => {
            const subscription = req.body;
            res.status(201).json({});
            const payload = JSON.stringify({ title: 'Notification Test' });      
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error(error.stack);
            });
        });
        log.info('Successfully started Notification Service! Passing to Web Service...');
        return app;
    }
}

module.exports = NotificationService;