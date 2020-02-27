'use strict';

/*
 * This service allows you to save and retrieve data with the app's MongoDB instance.
 * Connection configuration is pulled from ./config/config.json
 */

const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
let log;

class MongoDbPersister {
    constructor(root) {
        this.root = root;
        this.config = this.root.config;
        this.databaseConfig = this.config["database"];
        this.mongoConfig = this.databaseConfig["mongo"];
        this.mongoClient = mongodb.MongoClient;
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
        return this.mongoClient.connect(url, {useUnifiedTopology: true}).then(db => {
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
                _id: ObjectId(id)
            }).then(res => {
                db.done();
                return res;
            }).catch(() => log.error(`Failed to get item with "${id}".`));
        });
    }

    save(collection, data) {
        return this.connect().then(db => {
            const str = JSON.stringify(data);
            log.debug(`Saving ${str} to ${collection}`);
            return db.mirai.collection(collection).insertOne(data)
            .then(res => {
                db.done();
                let returnObj = {
                    insertedId: res.insertedId,
                    ok: 1
                };
                return returnObj;
            }).catch(() => log.error(`Failed to save item: ${str}`));
        });
    }

    replace(collection, id, data, upsert) {
        return this.connect().then(db => {
            const str = JSON.stringify(data);
            log.debug(`Saving ${str} to ${collection}`);
            return db.mirai.collection(collection).replaceOne({
                _id: ObjectId(id)
            }, data, {
                upsert: !upsert ? false : true
            })
            .then(res => {
                db.done();
                let returnObj = {
                    modifiedCount: res.modifiedCount,
                    ok: 1
                };
                return returnObj;
            }).catch(err => log.error(`Failed to replace item "${id}": ${str}`));
        });
    }

    find(collection, data) {
        return this.connect().then(db => {
            const str = JSON.stringify(data);
            log.debug(`Finding ${str} (one) in ${collection}`);
            return db.mirai.collection(collection).findOne(data)
            .then(res => {
                db.done();
                return res;
            }).catch(() => log.error(`Failed to find any item with ${data}.`));
        });
    }

    findMany(collection, data) {
        return this.connect().then(db => {
            const str = JSON.stringify(data);
            log.debug(`Finding ${str} (many) in ${collection}`);
            return db.mirai.collection(collection).find(data).toArray()
            .then(res => {
                db.done();
                return res;
            }).catch(() => log.error(`Failed to find items with ${dstrata}.`));
        });
    }

    delete(collection, data) {
        return this.connect().then(db => {
            const str = JSON.stringify(data);
            log.debug(`Deleting ${str} (one) in ${collection}`);
            return db.mirai.collection(collection).deleteOne(data)
            .then(res => {
                db.done();
                let returnObj = {
                    deletedCount: res.deletedCount,
                    ok: 1
                };
                return returnObj;
            }).catch(() => log.error(`Failed to delete any item with ${str}.`));
        });
    }

    deleteMany(collection, data) {
        return this.connect().then(db => {
            const str = JSON.stringify(data);
            log.debug(`Deleting ${str} (many) in ${collection}`);
            return db.mirai.collection(collection).deleteMany(data)
            .then(res => {
                db.done();
                let returnObj = {
                    deletedCount: res.deletedCount,
                    ok: 1
                };
                return returnObj;
            }).catch(() => log.error(`Failed to delete items ${str}.`));
        });
    }
}

module.exports = MongoDbPersister;