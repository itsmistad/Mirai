// EmailService.js
const nodemailer = require('nodemailer')
const mailgunTransport = require('nodemailer-mailgun-transport')

// Configure transport options
const mailgunOptions = {
  auth: {
    api_key: '428bf994fecabe16ca21c6c129a9a0e6-7238b007-255d17d4',
    domain: 'sandbox06b1194a15a640da9ef77fdeeddcc040.mailgun.org', //temporary
  }
}
const transport = mailgunTransport(mailgunOptions)
// EmailService
class EmailService {

  
  constructor() {
    this.emailClient = nodemailer.createTransport(transport)
  }
  sendText(to, subject, text) {
    return new Promise((resolve, reject) => {
      this.emailClient.sendMail({
        from: '"Mirai" <companyemailgoeshere>',
        to,
        subject,
        text,
      }, (err, info) => {
        if (err) {
          reject(err)
        } else {
          resolve(info)
        }
      })
    })
  }
}



module.exports = EmailService;