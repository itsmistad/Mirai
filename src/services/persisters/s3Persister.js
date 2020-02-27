'use strict';

const AWS = require('aws-sdk');
const bucketName = 'mirai-app';
let log;

class S3Persister {
    constructor(root) {
        this.root = root;
        this.s3 = new AWS.S3();
        log = root.log;
    }

    /*
     * contentType is an optional flag that defaults to "utf-8". Another acceptable value is "binary", for example.
     * This can be changed to other content types per this documentation:
     * https://nodejs.org/api/buffer.html#buffer_buf_tostring_encoding_start_end
     */
    get(key, contentEncoding = 'utf-8') {
        const params = {
            Bucket: bucketName,
            Key: key
        };
        var getObjectPromise = this.s3.getObject(params).promise();
        return getObjectPromise.then(data => {
            return data.Body.toString(contentEncoding);
        }).catch(err => log.error(`Failed to retrieve item with key "${key}" from bucket "${bucketName}". Error: ${err}`));
    }

    save(key, body, contentEncoding = 'utf-8') {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: body,
            ContentType: 'binary',
            ContentEncoding: contentEncoding
        };
        var putObjectPromise = this.s3.putObject(params).promise();
        return putObjectPromise.then(data => {
            return data;
        }).catch(err => log.error(`Failed to retrieve item with key "${key}" to bucket "${bucketName}". Error: ${err}`));
    }
}

module.exports = S3Persister;