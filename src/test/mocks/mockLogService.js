'use strict';

class MockLogService {
    constructor() {
        this.enable = false;
    }

    log(tag, message) {
        const colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            underscore: '\x1b[4m',
            magenta: '\x1b[35m',
        };
        if (this.enable)
            console.log(`${colors.underscore}[${new Date().toISOString()}]${colors.reset} ${colors.bright + colors.magenta}[${tag}]\t${message}${colors.reset}`);
    }
    
    info(message) {
        this.log('INFO', message);
    }

    error(message) {
        this.log('ERROR', message);
    }
    
    debug(message) {
        this.log('DEBUG', message);
    }
}

module.exports = MockLogService;