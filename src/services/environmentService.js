'use strict';

/*
 * This service exposes the ['application'] variables from ConfigService as static properties.
 */

class EnvironmentService {
    constructor(root) {
        this._env = root["config"]["application"];
    }
    get isProd() {
        return this._env.environment === "prod";
    }
    get isLocal() {
        return this._env.environment === "local";
    }
    get build() {
        return this._env.travis_build;
    }
    get version() {
        return this._env.version;
    }
}

module.exports = EnvironmentService;