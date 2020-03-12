'use strict';

const bodyParser = require('body-parser');
const configKeys = require('./config/configKeys');

let webpush = require('web-push');
let log, config;

class NotificationService {
    constructor(root, _webpush) {
        log = root.log;
        config = root.config;
        if (_webpush)
            webpush = _webpush;
    }

    async start(app) {
        log.info('Starting Notification Service...');
        const notif_email = await config.get(configKeys.notifications.email);
        log.debug(`Notification Contact retrieved from configuration: ${notif_email}`);
        const notif_public_key = await config.get(configKeys.notifications.public_key);
        log.debug(`Notification public key retrieved from configuration: ${notif_public_key}`);
        const notif_private_key = await config.get(configKeys.notifications.private_key);
        log.debug(`Notification private key retrieved from configuration: ${notif_private_key}`);
        
        webpush.setVapidDetails(notif_email, notif_public_key, notif_private_key);
        app.use(bodyParser.json());
        app.use((req, res, next) => {
            if (req.url.startsWith('/js/shared/serviceWorker.')) {
                res.append('Service-Worker-Allowed', '/');
            }
            next();
        });
        log.info('Successfully started Notification Service! Passing back to Web Service...');
        return app;
    }
}

module.exports = NotificationService;