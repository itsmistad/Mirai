'use strict';

const MockRootService = require('../mocks/mockRootService');

class UnitTest {
    static Setup() {
        this.Root = new MockRootService();
    }
}

module.exports = UnitTest;