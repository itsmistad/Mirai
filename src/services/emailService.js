'use strict';

const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
const configKeys = require('./config/configKeys');
let config;

class EmailService {
    constructor(root) {
        config = root.config;
    }

    createClient() {
        return new Promise(async (resolve, reject) => {
            try {
                // Configure transport options
                const mailgunOptions = {
                    auth: {
                        api_key: await config.get(configKeys.mailgun.api_key),
                        domain: await config.get(configKeys.mailgun.domain), 
                    }
                };
                const transport = mailgunTransport(mailgunOptions);
                this._emailClient = nodemailer.createTransport(transport);
                resolve();
            } catch(ex) {
                reject(eX);
            }
        });
    }

    sendEmail(to, subject, body) {
        return new Promise(async (resolve, reject) => {
            if (!this._emailClient) reject('emailClient was never successfully created.');
            try {
                const emailAddress = await config.get(configKeys.email.address);
                const emailName = await config.get(configKeys.email.name);
                this._emailClient.sendMail({
                    from: `"${emailName}" <${emailAddress}>`,
                    to,
                    subject,
                    body,
                }, (err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            } catch(ex) {
                reject(ex);
            }
        });
    }
}

module.exports = EmailService;