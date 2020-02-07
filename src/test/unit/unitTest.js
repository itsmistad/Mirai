'use strict';

const MockRootService = require('../mocks/mockRootService');

class UnitTest {
    static Setup() {
        this.Root = new MockRootService();
    }

    static SetConfig(config) {
        this.Root.config = config;
    }

    static SetLoggingFlag(flag) {
        this.Root.log.enable = flag;
    }
}

module.exports = UnitTest;