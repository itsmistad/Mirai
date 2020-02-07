'use strict';

var assert = require('assert');
const MongoDbPersister = require('../../../../services/persisters/mongoDbPersister');
const RootService = require('../../../../services/rootService');
const root = new RootService();
const persister = root.persister;

describe('mongoDbPersister', function() {
  describe('#connect()', function() {
    it('Check connection to MongoDB database', function(done) {
      persister.connect()
      .then(res => {
          assert.ok(res.done());
          done();
      });
    });
  });
});