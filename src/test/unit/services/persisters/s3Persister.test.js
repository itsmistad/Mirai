'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('[UNIT] s3Persister', function() {
  const s3Persister = require('../../../../services/persisters/s3Persister');
  const UnitTest = require('../../unitTest');

  UnitTest.Setup({
      database: {
          s3: {
              host: 'host',
              port: 0,
              user: 'user',
              pass: 'pass',
              auth: true
          }
      }
  });
  const s3 = new s3Persister(UnitTest.Root);

  it('should export service', function() {
    s3Persister.should.be.a("Function");
  });
});