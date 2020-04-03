'use strict';

const path = require('path');
const fs = require('fs');

let http, handlers = [], root, log;

function findByExtension(base,ext,files,result) 
{
    files = files || fs.readdirSync(base);
    result = result || [];

    files.forEach( 
        function (file) {
            var newbase = path.join(base,file);
            if (fs.statSync(newbase).isDirectory())
            {
                result = findByExtension(newbase, ext, fs.readdirSync(newbase), result);
            }
            else
            {
                if (file.substr(-1*(ext.length+1)) == '.' + ext)
                {
                    result.push(newbase);
                } 
            }
        }
    );
    return result;
}

class SocketService {
    constructor(_root) {
        root = _root;
        log = root.log;
    }

    setup(app) {
        http = require('http').createServer(app);
        this._io = require('socket.io')(http);
        let handlerFiles = findByExtension('./services/handlers/socket','js').filter(_ => _.includes('Handler'));
        for (let file of handlerFiles) {
            const Handler = require(`../${file}`);
            let handler = new Handler(root);
            log.info(`Registering socket.io handler: "${handler.constructor.name}"`);
            handlers.push(handler);
        }
        this._io.on('connection', client => {
            for (let h of handlers) {
                client.on(h.event, data => h.handle(this._io, client, data));
            }
        });
    }

    listen(port, callback) {
        http.listen(port, callback);
    }
}

module.exports = SocketService;