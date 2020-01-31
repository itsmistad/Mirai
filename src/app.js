'use strict';

const RootService = require('./services/rootService');

const root = new RootService();
const log = root.log;
const config = root.config;
const persister = root.persister;

class App {
    static async Start() {
      log.info('whyHelloThere!');
      log.info(config['whyHelloThere']); // Crucial Star Wars reference.

      persister.get('users', '5e337f4cc104af2140ffed61')
        .then(res => log.debug(`Searched for "5e337f4cc104af2140ffed61" and got "${JSON.stringify(res)}"`))
        .catch(err => log.error(err)); // Example of pulling data from MongoDB.
    }
}


App.Start(); // Pull the lever, Kronk!