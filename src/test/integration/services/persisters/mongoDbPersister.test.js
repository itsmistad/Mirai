'use strict';

const chai = require('chai');
chai.should();

describe('[INTEGRATION] mongoDbPersister', function() {
    const IntegrationTest = require('../../integrationTest');

    IntegrationTest.Setup();
    IntegrationTest.SetConfig({
        database: {
            mongo: {
                host: 'localhost',
                port: '27017',
                auth: false,
                user: '',
                pass: ''
            }
        }
    });

    const mongo = IntegrationTest.Root.mongo;

    function generateRandomName() { 
        let ans = '', arr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
        for (let i = 10; i > 0; i--) 
            ans += arr[Math.floor(Math.random() * arr.length)]; 
        return ans; 
    }
    const name = generateRandomName();

    describe('#save()', function() {
        it('New name saved to users database', function(done) {
            mongo.save('users',{name})
                .then(res => {
                    res.ok.should.equal(1);
                    done();
                }).catch(err => {
                    done(err);
                });
        });
    });
    describe('#find()', function() {
        it('New name (one) found in users database', function(done) {
            mongo.find('users',{name})
                .then(res => {
                    res.name.should.equal(name);
                    done();
                }).catch(err => {
                    done(err);
                });
        });
    });
    describe('#findMany()', function() {
        it('New name (many) found in users database', function(done) {
            mongo.findMany('users',{name})
                .then(res => {
                    res.length.should.equal(1);
                    res[0].name.should.equal(name);
                    done();
                }).catch(err => {
                    done(err);
                });
        });
    });
    describe('#delete()', function() {
        it('New name deleted (one) from users database', function(done) {
            mongo.delete('users',{name})
                .then(res => {
                    res.ok.should.equal(1);
                    done();
                }).catch(err => {
                    done(err);
                });
        });
    });
    describe('#deleteMany()', function() {
        it('New name deleted (many) from users database', function(done) {
            mongo.deleteMany('users',{name})
                .then(res => {
                    res.ok.should.equal(1);
                    done();
                }).catch(err => {
                    done(err);
                });
        });
    });
});