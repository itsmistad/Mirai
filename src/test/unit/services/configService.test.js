'use strict';

require('chai').should();
var sinon = require('sinon');

describe('configService', function() {
  const ConfigService = require('../../../services/configService');

  it('should export service', function() {
    ConfigService.should.be.a("Function");
  });

  describe('#load()', function() {
    it('should map config.json and package.json into the service', function() {
      
    });
  });
});