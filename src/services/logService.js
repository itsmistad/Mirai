'use strict';

const configKeys = require('./config/configKeys');
let mongo, config;

/*
 * This service implements 3 methods for logging: info, error, and debug.
 * Simply call the method with your specified message.
 * To add formatting, insert any property from "this.root.log.colors" before the text you desire to format.
 */

class LogService {
    constructor(root) {
        mongo = root.mongo;
        config = root.config;
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            dim: '\x1b[2m',
            underscore: '\x1b[4m',
            blink: '\x1b[5m',
            reverse: '\x1b[7m',
            hidden: '\x1b[8m',
            black: '\x1b[30m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            bg_black: '\x1b[40m',
            bg_red: '\x1b[41m',
            bg_green: '\x1b[42m',
            bg_yellow: '\x1b[43m',
            bg_blue: '\x1b[44m',
            bg_magenta: '\x1b[45m',
            bg_cyan: '\x1b[46m',
            bg_white: '\x1b[47m'
        };
    }

    log(tag, message, colorTag = '') {
        let resetTag = colorTag !== '' ? this.colors.reset : '';
        console.log(`${this.colors.underscore}[${new Date().toISOString()}]${this.colors.reset} ${colorTag}[${tag}]\t${message}${resetTag}`);
        return message;
    }

    error(message) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await config.get(configKeys.logging.level) >= 1) {
                    const obj = {
                        type: 'ERROR',
                        message
                    };
                    this.log(obj.type, message, this.colors.red + this.colors.bright);
                    mongo.save('logs', obj);
                }
                resolve(message);
            } catch (ex) {
                reject(ex);
            }
        });
    }
    
    info(message) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await config.get(configKeys.logging.level) >= 2) {
                    const obj = {
                        type: 'INFO',
                        message
                    };
                    this.log(obj.type, message, this.colors.white + this.colors.bright);
                    mongo.save('logs', obj);
                }
                resolve(message);
            } catch (ex) {
                reject(ex);
            }
        });
    }
    
    debug(message) {
        return new Promise(async (resolve, reject) => {
            try {
                if (config['log']['debug'] && await config.get(configKeys.logging.level) >= 3) {
                    const obj = {
                        type: 'DEBUG',
                        message
                    };
                    this.log(obj.type, message, this.colors.yellow + this.colors.bright);
                    mongo.save('logs', obj);
                }
                resolve(message);
            } catch (ex) {
                reject(ex);
            }
        });
    }
}

module.exports = LogService;