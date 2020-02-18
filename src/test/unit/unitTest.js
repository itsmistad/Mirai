'use strict';

const MockRootService = require('../mocks/mockRootService');

class UnitTest {
    static Setup(config) {
        this.Root = new MockRootService();
        this.Root.config = config;
    }

    static SetConfig(config) {
        this.Root.config = config;
    }

    static SetLoggingFlag(flag) {
        this.Root.log.enable = flag;
    }
}

module.exports = UnitTest;