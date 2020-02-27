'use strict';

/*
 * This service is meant to be passed around the constructors of the services
 * so that they don't need to import other services or maintain their own instances.
 * 
 * When adding a new service, be sure to include it in this service's constructor.
 */

const LogService = require('./logService');
const ConfigService = require('./config/configService');
const EnvironmentService = require('./environmentService');
const MongoDbPersister = require('./persisters/mongoDbPersister');
const S3Persister = require('./persisters/s3Persister');

class RootService {
    constructor() {
        this.log = new LogService(this);
        this.config = new ConfigService(this);
        this.config.load();
        this.env = new EnvironmentService(this);
        this.mongo = new MongoDbPersister(this);
        this.s3 = new S3Persister(this);
    }
}

module.exports = RootService;