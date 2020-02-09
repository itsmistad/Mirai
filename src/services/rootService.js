'use strict';

/*
 * This service is meant to be passed around the constructors of the services
 * so that they don't need to import other services or maintain their own instances.
 * 
 * When adding a new service, be sure to include it in this service's constructor.
 */

const LogService = require('./logService');
const ConfigService = require('./configService');
const EnvironmentService = require('./environmentService');
const MongoDbPersister = require('./persisters/mongoDbPersister');

class RootService {
    constructor() {
        this.log = new LogService();
        this.config = new ConfigService();
        this.config.load();
        this.env = new EnvironmentService(this);
        this.persister = new MongoDbPersister(this);
    }
}

module.exports = RootService;