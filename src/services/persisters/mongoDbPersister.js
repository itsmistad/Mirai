'use strict';

/*
 * This service allows you to save and retrieve data with the app's MongoDB instance.
 * Connection configuration is pulled from ./config/config.json
 */

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
let log;

class MongoDbPersister {
    constructor(root) {
        this.root = root;
        this.config = this.root.config;
        this.databaseConfig = this.config["database"];
        this.mongoConfig = this.databaseConfig["mongo"];
        log = this.root.log;
    }

    connect() {
        const host = this.mongoConfig.host;
        const port = this.mongoConfig.port;
        const user = this.mongoConfig.user;
        const pass = this.mongoConfig.pass;
        const auth = this.mongoConfig.auth;

        let url = 'mongodb://' +
            (auth ? `${user}:${pass}@` : '') +
            `${host}:${port}/`;

        log.debug('Connecting to db: ' + url);
        return MongoClient.connect(url, {useUnifiedTopology: true}).then(db => {
            log.debug('Connected.');
            var dbo = db.db("mirai");
            return {
                done: () => db.close(),
                mirai: dbo
            };
        }).catch(err => log.error('Failed to connect to database. Exception: ' + err));
    }

    get(collection, id) {
        return this.connect().then(db => {
            log.debug(`Retrieving ${id} from ${collection}`);
            return db.mirai.collection(collection).findOne({
                '_id': ObjectId(id)
            }).then(res => {
                db.done();
                return res;
            }).catch(() => log.error('Failed to get item.'));
        });
    }

    save(data) {

    }

    find(data) {

    }
}

module.exports = MongoDbPersister;