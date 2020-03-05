'use strict';

const deasync = require('deasync');

function isAsync(func) {
    return func.constructor.name === 'AsyncFunction';
}

class AsyncHelper {
    static synchronize(func) {
        if (isAsync(func)) {
            return deasync(func);
        }
        return func;
    }
}

module.exports = AsyncHelper;