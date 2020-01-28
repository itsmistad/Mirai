'use strict';

const RootService = require('./services/rootService');

const root = new RootService();
const log = root.log;
const config = root.config;

class App {
    static Start() {
        log.info(config['whyHelloThere']); // Crucial Star Wars reference.
    }
}

App.Start(); // Pull the lever, Kronk!