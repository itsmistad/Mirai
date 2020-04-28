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

    async handle(io, otherUsers, currentUser) {
        if (!currentUser.googleId) {
            currentUser.client.emit('dashboardLoadFailed', {
                message: 'You must be logged in to load a dashboard.'
            });  
            return;
        }

        let previousInterval = saveIntervals.find(_ => _.googleId === currentUser.googleId);
        if (previousInterval) 
            clearInterval(previousInterval.interval);

        let userObj = await mongo.find('users', {
            googleId: currentUser.googleId
        });

        log.debug('Loading dashboard for user: ' + currentUser.googleId);

        if (!userObj.dashboardId) {
            let dashboard = {
                ownerGoogleId: currentUser.googleId,
                folders: [],
                cards: []
            };

            // Create the dashboard entry.
            mongo.save('dashboards', dashboard).then(data => {
                // Update the user's dashboard id.
                mongo.update('users', {
                    googleId: currentUser.googleId
                }, {
                    $set: {
                        dashboardId: data.insertedId
                    }
                });
            });
            startSaveInterval(currentUser.client, currentUser, dashboard);
        } else {
            // Load the user's personal dashboard.
            mongo.get('dashboards', userObj.dashboardId)
                .then(dashboard => {
                    startSaveInterval(currentUser.client, currentUser, dashboard);
                })
                .catch(() => {
                    // If the user has a dashboard id but no dashboard entry, something is very wrong. Clear the id and warn the user.
                    mongo.update('users', {
                        googleId: currentUser.googleId
                    }, {
                        $set: {
                            dashboardId: 0
                        }
                    });
                    currentUser.client.emit('dashboardLoadFailed', {
                        message: 'Something went wrong while loading your dashboard. You may have to start over...'
                    });  
                    log.error(`Something went wrong while loading a user's (${currentUser.googleId}) personal dashboard. The ID was there but the entry wasn't.`);
                });
        }
    }
}

module.exports = DashboardLoadHandler;