'use strict';

const MockRootService = require('../mocks/mockRootService');
const ConfigService = require('../../services/config/configService');

class UnitTest {
    static Setup() {
        this.Root = new MockRootService();
        this.Root.config = new ConfigService(this);
        this.Root.config.load();
    }

    static SetConfig(config) {
        for (const key in config) {
            this.Root.config[key] = config[key];
        }
    }

    static SetLoggingFlag(flag) {
        this.Root.log.enable = flag;
    }
}

module.exports = UnitTest;