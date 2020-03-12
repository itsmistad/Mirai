/*
 * network.js
 * 
 * This script contains a bundle wrapper for both ajax and socket.io functionality.
 * 
 * Usage for socket.io:
 *  - network.on('eventName', json => { console.log(JSON.stringify(json)); }).send(...).on(...); // Allows .send and .on chaining; this function will automatically connect for you!
 *  - network.send('eventName', json, err => { console.error(err); }); // Allows for queueing - any messages emitted before a connection is established will be emitted the moment we connect.
 *  
 *  Usage for ajax:
 *  - network.post('/route/to/method', json, json => { console.log(JSON.stringify(json)); });
 *  - network.get('/route/to/method', json, json => { console.log(JSON.stringify(json)); });
 * 
 *  To enable debug messaging, set network.debug to true before any *.on() calls.
 * 
 *  Note: "json" is a json object, not a string.
 */

const network = new function() {
    let obj = {};
    let connection, queue, events = [];
    const log = m => obj.debug ? console.log(m) : {};
    const logErr = e => obj.debug ? console.error(e) : {};

    obj.debug = true;

    obj.on = (event, func) => {
        if (!connection && io) {
            const baseUrl = window.location.href.split('/').length > 2 ? window.location.href.replace(window.location.href.split('/')[3], '') : window.location.href;
            if (baseUrl.endsWith('3001/'))
                baseUrl.replace('3001/', '3000');
            log(`Connecting to ${baseUrl}...`);
            connection = io.connect(baseUrl);
            if (connection) {
                log('Connected successfully!');
                if (queue) {
                    for (let i = 0; i < queue.length; i++) {
                        let queueParams = queue.shift();
                        obj.send(queueParams.event, queueParams.json, queueParams.callback);
                    }
                    queue = null;
                }
            } else {
                logErr('Failed to connect through socket.io!');
            }
        }

        if (connection && !events.includes(event)) {
            connection.on(event, json => {
                log(`Received ${event}: ${JSON.stringify(json)}`);
                if (func) func(json);
            });
            events.push(event);
        }
        return obj;
    };

    obj.send = (event, json, callback) => {
        if (!connection) { // Allows queueing while a connection is being established.
            if (!queue) queue = [];
            queue.push({
                event, json, callback
            });
            return;
        }
        var str = JSON.stringify(json);
        log(`Sending ${event}: ${str}`);
        connection.emit(event, json, callback);
        return obj;
    };

    obj.post = (route, json, func) => {
        $.ajax({
            type: "POST",
            url: route,
            data: JSON.stringify(json),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: response => {
                log(response.toString());
                func(response);
            },
            failure: response => {
                logErr(response.toString());
                func(response);
            },
            error: response => {
                logErr(response.toString());
                func(response);
            }
        });  
    };

    obj.get = (route, json, func) => {
        $.ajax({
            type: "GET",
            url: route,
            data: JSON.stringify(json),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: response => {
                log(response.toString());
                func(response);
            },
            failure: response => {
                logErr(response.toString());
                func(response);
            },
            error: response => {
                logErr(response.toString());
                func(response);
            }
        });
    };

    return obj;
}