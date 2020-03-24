'use strict';

const webpush = require('web-push');
let log;

class NotificationController {
    constructor(root) {
        this.name = 'Notification';
        log = root.log;
    }

    async run(route, req, res) {
        if (route === 'subscribe') {
            const subscription = req.body;
            res.status(201).json({});
            const payload = JSON.stringify({ title: 'Notification Test' });   
               
            webpush.sendNotification(subscription, payload).catch(error => {
                log.error(`Error sending notification: ${error}`);
            });
        }
    }
}

module.exports = NotificationController;