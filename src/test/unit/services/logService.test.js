'use strict';

require('chai').should();
var sinon = require('sinon');

const LogService = require('../../../services/logService');
const MongoDbPersister = require('../../../services/persisters/mongoDbPersister');
const UnitTest = require('../unitTest');
let saveStub, configStub, logStub, log;

describe('[UNIT] logService', function() {
  before(function() {
    UnitTest.Setup();
    UnitTest.SetConfig({
      log: {
        debug: true
      },
      database: {
        mongo: null
      }
    });
    UnitTest.Root.mongo = new MongoDbPersister(UnitTest.Root);
    saveStub = sinon.stub(UnitTest.Root.mongo, 'save').callsFake(() => {});
    configStub = sinon.stub(UnitTest.Root.config, 'get');
    log = new LogService(UnitTest.Root);
    logStub = sinon.stub(log, 'log').callsFake(() => {});
  });

  it('should export service', function() {
    LogService.should.be.a("Function");
  });

  describe('#debug()', function() {
    it('should invoke log() with tag "DEBUG"', function(done) {
      // setup
      configStub.returns(3);
      // execute
      log.debug('debug').then(data => {
        // assert
        data.should.equal('debug');
        sinon.assert.calledWith(logStub, 'DEBUG', 'debug');
        sinon.assert.calledWith(saveStub, 'logs', {
          type: 'DEBUG',
          message: 'debug'
        });
        done();
      }).catch(err => done(err));
    });
  });

  describe('#info()', function() {
    it('should invoke log() with tag "INFO"', function(done) {
      // setup
      configStub.returns(2);
      // execute
      log.info('info').then(data => {
        // assert
        data.should.equal('info');
        sinon.assert.calledWith(logStub, 'INFO', 'info');
        sinon.assert.calledWith(saveStub, 'logs', {
          type: 'INFO',
          message: 'info'
        });
        done();
      }).catch(err => done(err));
    });
  });

  describe('#error()', function() {
    it('should invoke log() with tag "ERROR"', function(done) {
      // setup
      configStub.returns(1);
      // execute
      log.error('error').then(data => {
        // assert
        data.should.equal('error');
        sinon.assert.calledWith(logStub, 'ERROR', 'error');
        sinon.assert.calledWith(saveStub, 'logs', {
          type: 'ERROR',
          message: 'error'
        });
        done();
      }).catch(err => done(err));
    });
  });
});