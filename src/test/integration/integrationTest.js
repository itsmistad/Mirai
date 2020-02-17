'use strict';

const MockRootService = require('../mocks/mockRootService');
const MongoDbPersister = require('../../services/persisters/mongoDbPersister');
const ConfigService = require('../../services/config/configService');

class IntegrationTest {
    static Setup() {
        this.Root = new MockRootService();
        this.Root.config = new ConfigService(this.Root);
        this.Root.config.load();
        this.Root.mongo = new MongoDbPersister(this.Root);
    }

    static SetConfig(config) {
        this.Root.config = config;
    }

    static SetLoggingFlag(flag) {
        this.Root.log.enable = flag;
    }
}

module.exports = IntegrationTest;