`use strict`;

const RootService = require('../services/rootService');
const fs = require('fs');
const path = require('path');
const mongodb = require('mongodb');

const root = new RootService();
const ObjectId = mongodb.ObjectId;
const log = root.log;
const scriptsPath = path.join(__dirname, 'scripts');
const args = process.argv.slice(2);

class Migrator {
    constructor(_root) {
        this.log = _root.log;
        this.get = (collection, id) => _root.mongo.get(collection, id);
        this.save = (collection, data) => _root.mongo.save(collection, data);
        this.replace = (collection, id, data, upsert) => _root.mongo.replace(collection, id, data, upsert);
        this.find = (collection, data) => _root.mongo.find(collection, data);
        this.findMany = (collection, data) => _root.mongo.findMany(collection, data);
        this.delete = (collection, data) => _root.mongo.delete(collection, data);
        this.deleteMany = (collection, data) => _root.mongo.deleteMany(collection, data);
    }
}

const migrator = new Migrator(root);

async function runMigrations(currentTimestamp, timestampId) {
    let specifiedTimestamp = 0, lastTimestamp = 0;
    if (currentTimestamp == null)
        currentTimestamp = 0;

    if (args.length > 0) {
        specifiedTimestamp = parseInt(args[0]);
        if (specifiedTimestamp && specifiedTimestamp !== 'NaN') {
            log.info(`Timestamp specified as "${specifiedTimestamp}". Migrations after this timestamp will be skipped or rolled back.`)
        } else specifiedTimestamp = 0;
    } 

    log.info(`${log.colors.dim + log.colors.white}Checking for migration scripts...`);

    try {
        const files = fs.readdirSync(scriptsPath);
        const migrations = files.filter(function (fileName) {
            const filePath = path.join(scriptsPath, fileName);
            const isDir = fs.lstatSync(filePath).isDirectory();
            const isMigration = /^([0-9]+)-{1}([0-9]+)(\.js){1}$/.test(fileName);
            return !isDir && isMigration;
        }).sort();

        const getFileTimestamp = fileName => parseInt(fileName.split('-')[1].replace('.js', ''));
        const shouldMigrateUp = function(fileName, specifiedTimestamp, currentTimestamp) {
            const fileTimestamp = getFileTimestamp(fileName);
            return (!specifiedTimestamp || fileTimestamp <= specifiedTimestamp) && fileTimestamp > currentTimestamp && fileTimestamp < Math.floor(Date.now() / 1000);
        };
        const shouldMigrateDown = function(fileName, specifiedTimestamp, currentTimestamp) {
            const fileTimestamp = getFileTimestamp(fileName);
            return specifiedTimestamp && fileTimestamp > specifiedTimestamp && fileTimestamp <= currentTimestamp && fileTimestamp < Math.floor(Date.now() / 1000);
        };

        const upMigrations = migrations.filter(fileName => shouldMigrateUp(fileName, specifiedTimestamp, currentTimestamp));
        const downMigrations = migrations.filter(fileName => shouldMigrateDown(fileName, specifiedTimestamp, currentTimestamp)).reverse();
        const totalCount = upMigrations.length + downMigrations.length;
        if (upMigrations.length > 0)
            lastTimestamp = getFileTimestamp(upMigrations[upMigrations.length - 1]);
        else if (downMigrations.length > 0 && migrations.length > 1) {
            lastFilename = migrations[migrations.indexOf(downMigrations[downMigrations.length - 1]) - 1];
            lastTimestamp = lastFilename != null ? getFileTimestamp(lastFilename) : 0;
        }

        log.info(`${log.colors.yellow}Found ${totalCount} migration script(s) to execute (${upMigrations.length} up, ${downMigrations.length} down, ${migrations.length - totalCount} skipped).`);
        
        const execute = async function (migrations, shouldMigrateDown) {
            for (let fileName of migrations) {
                const fileTimestamp = getFileTimestamp(fileName);
                log.info(`${log.colors.dim + log.colors.magenta} > ${fileName.replace('.js', '')}:`)
                try {
                    const filePath = path.join(scriptsPath, fileName);
                    const js = require(filePath);
        
                    if (js.desc == null || js.up == null) {
                        log.error('\tMigration is missing either "desc" or "up". Skipping...');
                        continue;
                    }

                    try {
                        if (!shouldMigrateDown) {
                            log.info(`${log.colors.green}\t+ Up ("${js.desc}").`);
                            if (js.up.constructor.name === 'AsyncFunction')
                                await js.up(migrator);
                            else
                                js.up(migrator);
                            continue;
                        }

                        if (shouldMigrateDown && js.down != null) {
                            log.info(`${log.colors.red}\t- Down ("${js.desc}").`);
                            if (js.down.constructor.name === 'AsyncFunction')
                                await js.down(migrator);
                            else
                                js.down(migrator);
                            continue;
                        }

                        log.info(`${log.colors.dim + log.colors.white}\tSkipping... ("${js.desc}")`);
                    } catch (ex) {
                        log.error(`\tSomething went wrong while migrating. Error: ${ex}`);
                    }
                } catch (ex) {
                    log.error(`\tSomething went wrong while loading. Error: ${ex}`);
                }
            }
        };
        
        if (totalCount > 0) {
            if (upMigrations.length > 0) {
                log.info('Executing upward migrations:');
                await execute(upMigrations, false);
            }
            
            if (downMigrations.length > 0) {
                log.info('Executing downward migrations:');
                await execute(downMigrations, true);
            }

            migrator.replace('migrator', timestampId, {
                key: 'currentTimestamp',
                value: lastTimestamp
            }, true)
            .then(() => log.info(`${log.colors.green}Done!`))
            .catch(() => log.error('Failed to store new currentTimestamp to migrator collection.'));
        }
    } catch (ex) {
        log.error(`Failed to find migrations. Error: ${ex}`);
    }
}

migrator.find('migrator', {key: 'currentTimestamp'})
.then(currentTimestampObj => currentTimestampObj.value != null ? runMigrations(currentTimestampObj.value, currentTimestampObj._id) : runMigrations())
.catch(() => runMigrations());