'use strict';

var assert = require('assert');
const MongoDbPersister = require('../../../../services/persisters/mongoDbPersister');
const RootService = require('../../../../services/rootService');
const root = new RootService();
const persister = root.persister;

describe('mongoDbPersister', function() {
  describe('#save()', function() {
    it('New name saved to users database', function(done) {
        persister.save('users',{name:"a13c7866-3f6c-4b54"})
        .then(res => {
          assert.equal(res.ok,1);
          done();
        });
    });
  });
  describe('#find()', function() {
      it('New name (one) found in users database', function(done) {
        persister.find('users',{name:"a13c7866-3f6c-4b54"})
        .then(res => {
          assert.equal(res.name,"a13c7866-3f6c-4b54");
          done();
        });
      });
  });
  describe('#findMany()', function() {
    it('New name (many) found in users database', function(done) {
      persister.findMany('users',{name:"a13c7866-3f6c-4b54"})
      .then(res => {
        assert.equal(res[0].name,"a13c7866-3f6c-4b54");
        done();
      });
    });
  });
  describe('#delete()', function() {
      it('New name deleted (one) from users database', function(done) {
        persister.delete('users',{name:"a13c7866-3f6c-4b54"})
        .then(res => {
            assert.equal(res.ok,1);
            done();
        });
      });
  });
  describe('#deleteMany()', function() {
    it('New name deleted (many) from users database', function(done) {
      persister.deleteMany('users',{name:"a13c7866-3f6c-4b54"})
      .then(res => {
          assert.equal(res.ok,1);
          done();
      });
    });
  });
});