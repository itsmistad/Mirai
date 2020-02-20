'use strict';

const chai = require('chai');
chai.should();

describe('[INTEGRATION] s3Persister', function() {
    const IntegrationTest = require('../../integrationTest');

    IntegrationTest.Setup({
        database: {
        s3: {
            host: 'localhost',
            port: '27017',
            auth: false,
            user: '',
            pass: ''
        }
        }
    });

    const s3 = IntegrationTest.Root.s3;

    function generateRandomName() { 
        let ans = '', arr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
        for (let i = 10; i > 0; i--) 
        ans += arr[Math.floor(Math.random() * arr.length)]; 
        return ans; 
    }
    const name = generateRandomName();

    describe('#save()', function() {
        it('New name saved to s3 bucket', function(done) {
        s3.save('users',{name})
            .then(res => {
            res.ok.should.equal(1);
            done();
            }).catch(err => {
            done(err);
            });
        });
    });
});