'use strict';

let log;

class DisconnectHandler {
    constructor(root) {
        this.event = 'disconnect';
        log = root.log;
    }

    // eslint-disable-next-line no-unused-vars
    handle(io, client, user, data) {
        log.debug('Disconnected a client: ' + JSON.stringify(user));
    }
}

module.exports = DisconnectHandler;