'use strict';

require('chai').should();

describe('rootService', function() {
  const RootService = require('../../../services/rootService');

  it('should export service', function() {
    RootService.should.be.a("Function");
  });
});