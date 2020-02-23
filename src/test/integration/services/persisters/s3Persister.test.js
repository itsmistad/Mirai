'use strict';

const chai = require('chai');
chai.should();

describe('[INTEGRATION] s3Persister', function() {
  const IntegrationTest = require('../../integrationTest');
  IntegrationTest.Setup();
  const s3 = IntegrationTest.Root.s3;

  describe('#save()', function() {
    // This test is temporarily disabled. Enable it once our code deploys to production and the S3 bucket "mirai-app" exists.
    it.skip('should save a file to an S3 bucket', function(done) {
      s3.save('TestFile', {
        Body: 'Body'
      }).then(data => {
        done();
      }).catch(err => {
        done(err);
      });
      setTimeout(done('Failed to save the test file within 5 seconds. Is our S3 bucket online?'), 4950);
    });
  });

  describe('#get()', function() {
    // This test is temporarily disabled. Enable it once our code deploys to production and the S3 bucket "mirai-app" exists.
    it.skip('should retrieve a file from an S3 bucket', function(done) {
      s3.get('TestFile').then(data => {
          console.log('resolved ' + JSON.stringify(data));
        data.should.deep.equal({
          res: 'ok'
        });
        done();
      }).catch(err => {
        console.log('rejected ' + err);
          done(err);
      });
      setTimeout(done('Failed to retrieve the test file within 5 seconds. Is our S3 bucket online?'), 4950);
    });
  });
});