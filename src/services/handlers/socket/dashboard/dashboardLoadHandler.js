'use strict';

let saveIntervals = [], mongo, log;

function startSaveInterval(client, user, dashboard) {
    client.emit('dashboardLoadComplete', {
        folders: dashboard.folders,
        cards: dashboard.cards
    });  

    saveIntervals.push({
        googleId: user.googleId,
        interval: setInterval(() => {
            client.emit('dashboardSaveRequest');
        }, 3000)
    });
}


class DashboardLoadHandler {
    constructor(root) {
        this.event = 'dashboardLoad';
        mongo = root.mongo;
        log = root.log;
    }

    // eslint-disable-next-line no-unused-vars
    async handle(io, client, user, data) {
        if (!user.googleId) {
            client.emit('dashboardLoadFailed', {
                message: 'You must be logged in to load a dashboard.'
            });  
            return;
        }

        let previousInterval = saveIntervals.find(_ => _.googleId === user.googleId);
        if (previousInterval) 
            clearInterval(previousInterval.interval);

        let userObj = await mongo.find('users', {
            googleId: user.googleId
        });

        log.debug('Loading dashboard for user: ' + user.googleId);

        if (!userObj.dashboardId) {
            let dashboard = {
                ownerGoogleId: user.googleId,
                folders: [],
                cards: []
            };

            // Create the dashboard entry.
            mongo.save('dashboards', dashboard).then(data => {
                // Update the user's dashboard id.
                mongo.update('users', {
                    googleId: user.googleId
                }, {
                    $set: {
                        dashboardId: data.insertedId
                    }
                });
            });
            startSaveInterval(client, user, dashboard);
        } else {
            // Load the user's personal dashboard.
            mongo.get('dashboards', userObj.dashboardId)
                .then(dashboard => {
                    startSaveInterval(client, user, dashboard);
                })
                .catch(() => {
                    // If the user has a dashboard id but no dashboard entry, something is very wrong. Clear the id and warn the user.
                    mongo.update('users', {
                        googleId: user.googleId
                    }, {
                        $set: {
                            dashboardId: 0
                        }
                    });
                    client.emit('dashboardLoadFailed', {
                        message: 'Something went wrong while loading your dashboard. You may have to start over...'
                    });  
                    log.error(`Something went wrong while loading a user's (${user.googleId}) personal dashboard. The ID was there but the entry wasn't.`);
                });
        }
    }
}

module.exports = DashboardLoadHandler;