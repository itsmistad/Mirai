'use strict';

require('chai').should();
var sinon = require('sinon');

describe('[UNIT] logService', function() {
    const LogService = require('../../../services/logService');
    const UnitTest = require('../unitTest');
    UnitTest.Setup();
    UnitTest.SetConfig({
        log: {
            debug: true
        }
    });
    const log = new LogService(UnitTest.Root);
    const logStub = sinon.stub(log, 'log').returns(null);

    it('should export service', function() {
        LogService.should.be.a('Function');
    });

    describe('#debug()', function() {
        it('should invoke log() with tag "DEBUG"', function() {
            log.debug('debug');
            sinon.assert.calledWith(logStub, 'DEBUG', 'debug');
        });
    });

    describe('#info()', function() {
        it('should invoke log() with tag "INFO"', function() {
            log.info('info');
            sinon.assert.calledWith(logStub, 'INFO', 'info');
        });
    });

    describe('#error()', function() {
        it('should invoke log() with tag "ERROR"', function() {
            log.error('error');
            sinon.assert.calledWith(logStub, 'ERROR', 'error');
        });
    });
});