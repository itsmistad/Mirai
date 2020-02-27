'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

const EmailService = require('../../../services/emailService');
const configKeys = require('../../../services/config/configKeys');
const UnitTest = require('../unitTest');

let email, sendMailStub;

describe('[UNIT] emailService', function() {
  before(function() {
    UnitTest.Setup();
    email = new EmailService(UnitTest.Root);
    email._emailClient = {
      sendMail: () => {}
    };
    sendMailStub = sinon.stub(email._emailClient, 'sendMail').callsFake((options, callback) => {
      callback(null, 'ok');
    });
  });

  it('should export service', function() {
    EmailService.should.be.a("Function");
  });

  describe('#sendEmail()', function() {
    it('should invoke sendMail() with specified options', function(done) {
      // setup
      UnitTest.SetDbConfig([{
        key: configKeys.email.address.key,
        value: 'email@test.com'
      }, {
        key: configKeys.email.name.key,
        value: 'test'
      }]);
      // execute
      email.sendEmail('to', 'subject', 'body').then(res => {
        // assert
        res.should.equal('ok');
        sendMailStub.should.have.been.calledOnceWith({
            from: '"test" <email@test.com>',
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