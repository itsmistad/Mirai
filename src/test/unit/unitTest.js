'use strict';

const MockRootService = require('../mocks/mockRootService');
const ConfigService = require('../../services/config/configService');

class UnitTest {
    static Setup() {
        this.Root = new MockRootService();
        this.Root.config = new ConfigService(this);
        this.Root.config.load();
        this.Root.config.get = async () => {};
    }

    static SetConfig(config) {
        this.Root.config = config;
    }

    static SetLoggingFlag(flag) {
        this.Root.log.enable = flag;
    }
}

module.exports = UnitTest;