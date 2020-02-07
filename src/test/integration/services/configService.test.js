'use strict';

require('chai').should();

describe('[INTEGRATION] configService', function() {
  const ConfigService = require('../../../services/configService');

  it('should export service', function() {
    ConfigService.should.be.a("Function");
  });

  describe('#load()', function() {
    it('should map config.json and package.json into the service', function() {
      const configService = new ConfigService();
      configService.load();
      configService['application'].should.not.be.undefined;
      configService['application']['version'].should.be.a('string');
      configService['application']['environment'].should.be.a('string');
    });
  });
});