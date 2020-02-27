'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('[UNIT] emailService', function() {
  const EmailService = require('../../../services/emailService');
  const UnitTest = require('../unitTest');
  const unitTest = new UnitTest({
    mailgun: {
      email_address: 'email_address',
      api_key: 'api_key',
      domain: 'domain'
    }
  });
  const email = new EmailService(unitTest.root);
  email.emailClient = {
    sendMail: () => {}
  };
  const sendMailStub = sinon.stub(email.emailClient, 'sendMail').callsFake((options, callback) => {
    callback(null, 'ok');
  });

  it('should export service', function() {
    EmailService.should.be.a("Function");
  });

  describe('#sendEmail()', function() {
    it('should invoke sendMail() with specified options', function(done) {
      email.sendEmail('to', 'subject', 'body').then(res => {
        res.should.equal('ok');
        sendMailStub.should.have.been.calledOnceWith({
            from: `"Mirai" <${unitTest.root.config['mailgun']['email_address']}>`,
            to: 'to',
            subject: 'subject',
            body: 'body'
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});