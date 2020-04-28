'use strict';

const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
const configKeys = require('./config/configKeys');
let config, env, log;

class EmailService {
    constructor(root) {
        config = root.config;
        env = root.env;
        log = root.log;
    }

    async createClient() {
        const api_key = await config.get(configKeys.mailgun.api_key);
        const domain = await config.get(configKeys.mailgun.domain);
        try {
            if (env.isLocal) {
                log.info('Successfully started local email service!');
                this._emailClient = nodemailer.createTransport({
                    port: 25,
                    host: 'localhost',
                    tls: {
                        rejectUnauthorized: false
                    },
                });
                return;
            }
            // Configure transport options
            const mailgunOptions = {
                auth: {
                    api_key,
                    domain, 
                }
            };
            const transport = mailgunTransport(mailgunOptions);
            this._emailClient = nodemailer.createTransport(transport);
        } catch(ex) {
            log.error('Failed to start the email service. Error: ' + ex);
        }
    }

    async sendEmail(to, subject, body) {
        const name = await config.get(configKeys.email.name);
        const address = await config.get(configKeys.email.address);
        return new Promise((resolve, reject) => {
            if (!this._emailClient) reject('emailClient was never successfully created.');
            try {
                this._emailClient.sendMail({
                    from: `"${name}" <${address}>`,
                    to,
                    subject,
                    html: body,
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