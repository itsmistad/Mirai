'use strict';

const RootService = require('./services/rootService');
const configKeys = require('./services/config/configKeys');

const root = new RootService();
const log = root.log;
const config = root.config;

class App {
    static async Start() {
        const loggingLevel = await config.get(configKeys.logging.level);
        log.info(`Current Logging.Level: ${loggingLevel}`);
    }
}

App.Start(); // Pull the lever, Kronk!