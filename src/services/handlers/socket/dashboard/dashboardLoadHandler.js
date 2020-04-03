'use strict';

let saveIntervals = [], mongo, log;

function startSaveInterval(client, dashboard) {
    client.emit('dashboardLoadComplete', {
        folders: dashboard.folders,
        cards: dashboard.cards
    });  

    saveIntervals.push({
        googleId: client.request.user.googleId,
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
    async handle(io, client, data) {
        if (!client.request.user.logged_in) {
            client.emit('dashboardLoadFailed', {
                message: 'You must be logged in to load a dashboard.'
            });  
            return;
        }

        let previousInterval = saveIntervals.find(_ => _.googleId === client.request.user.googleId);
        if (previousInterval) 
            clearInterval(previousInterval.interval);

        let user = await mongo.find('users', {
            googleId: client.request.user.googleId
        });

        log.debug('Loading dashboard for user: ' + user.googleId);

        if (!user.dashboardId) {
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
            startSaveInterval(client, dashboard);
        } else {
            // Load the user's personal dashboard.
            mongo.get('dashboards', user.dashboardId)
                .then(dashboard => {
                    startSaveInterval(client, dashboard);
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