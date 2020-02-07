'use strict';

const MockRootService = require('../mocks/mockRootService');
const MongoDbPersister = require('../../services/persisters/mongoDbPersister');

class IntegrationTest {
    static Setup(config) {
        this.Root = new MockRootService();
        this.Root.config = config;
        this.Root.persister = new MongoDbPersister(this.Root);
    }

    static SetConfig(config) {
        this.Root.config = config;
    }

    static SetLoggingFlag(flag) {
        this.Root.log.enable = flag;
    }
}

module.exports = IntegrationTest;