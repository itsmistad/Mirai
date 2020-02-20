'use strict';

const fs = require('fs');
const AWS = require('aws-sdk');

const bucketName = "mirai-app";
const MongoDbPersister = require('./persisters/mongoDbPersister');


class s3Persister {
    constructor(root) {
        this.mongo = new MongoDbPersister(this);
    }

    get(key, body) {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: body
        };
        s3.download(params).then(data => { }).catch(err => { });
    }

    save(key, body) {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: body
        };
        s3.upload(params).then(data => { }).catch(err => { });
    }
}