'use strict';

const configKeys = require('./config/configKeys');
let config, mongo, email, log;

function getDateFromCardDateTime(cardDate, cardTime) {
    if (cardDate) {
        let dateArray = cardDate.split(/\D/);
        let timeArray = cardTime.split(':');
        let date;
        if (cardTime)
            date = new Date(dateArray[0], --dateArray[1], dateArray[2], timeArray[0], timeArray[1], 0);
        else
            date = new Date(dateArray[0], --dateArray[1], dateArray[2], 10, 0, 0);

        return date;
    }
    return null;
}

class ReminderService {
    constructor(root) {
        config = root.config;
        mongo = root.mongo;
        email = root.email;
        log = root.log;
        config.get(configKeys.remind.time_interval).then(timeInterval => {
            if (timeInterval < 1800000)
            {
                timeInterval = 1800000;
            }
            setInterval(() => this.remindUsers(), timeInterval);
        });
    }

    remindUsers() {
        mongo.findMany('users', {}).then(userObjs => {
            for (let user of userObjs)
            {
                //Pull each dashboard from the dashboard collection
                if (!user.dashboardId) continue;
                mongo.get('dashboards', user.dashboardId).then(dashboardObj => {
                    let cardsDue = [];
                    if (!dashboardObj) return;
                    //Loop through the list of cards in the dashboard object
                    for (let card of dashboardObj.cards) {
                        if (!card.date) continue;
                        let date = getDateFromCardDateTime(card.date, card.time);
    
                        let tomorrowDate = new Date();
                        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    
                        let isDueTomorrow = date.getFullYear() === tomorrowDate.getFullYear() &&
                        date.getMonth() === tomorrowDate.getMonth() &&
                        date.getDate() === tomorrowDate.getDate();
                        if (isDueTomorrow && !card.hasSentNotification) {
                            dashboardObj.cards.find(_ => _.id === card.id).hasSentNotification = true;
                            mongo.update('dashboards', {
                                _id: user.dashboardId
                            }, {
                                $set: {
                                    cards: dashboardObj.cards
                                }
                            });
                            cardsDue.push({
                                name: card.name,
                                date: card.date,
                                time: card.time
                            });
                        }
                    }
                    if (!cardsDue.length) return;
                    try {
                        let body = 'The following cards are due tomorrow: ';
                        for (let card of cardsDue) {
                            let time = card.time;
                            let hour = parseInt(time.split(':')[0]);
                            let minute = time.split(':')[1];
                            if (hour < 12) {
                                if (hour === 0) {
                                    hour = 12;
                                }
                                time = hour + ':' + minute + ' AM';
                            } else {
                                if (hour != 12) {
                                    hour -= 12;
                                }
                                time = hour + ':' + minute + ' PM';
                            }

                            body += `<br> - ${card.name} at ${time}`;
                        }
                        body += '<br> Checkout <a href="https://miraiapp.co">Mirai</a> to wrap up these cards.';
                        email.sendEmail(user.email, '📧 You have something due tomorrow!', body);
                    } catch (ex) {
                        log.error('Something has gone very wrong when sending an email through the reminder service... Error: ' + ex);
                    }
                });
            }
        });
    }
}

module.exports = ReminderService;