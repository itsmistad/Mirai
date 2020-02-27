'use strict';

const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
let config;

class EmailService {
  constructor(root) {
    config = root.config;
  }

  createClient() {
    // Configure transport options
    const mailgunOptions = {
      auth: {
        api_key: config['mailgun']['api_key'],
        domain: config['mailgun']['domain'], 
      }
    };
    const transport = mailgunTransport(mailgunOptions);
    this.emailClient = nodemailer.createTransport(transport);
  }

  sendEmail(to, subject, body) {
    return new Promise((resolve, reject) => {
      this.emailClient.sendMail({
        from: `"Mirai" <${config['mailgun']['email_address']}>`,
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
    });
  }
}

module.exports = EmailService;