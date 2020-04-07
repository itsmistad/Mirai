'use strict';

require('chai').should();
var sinon = require('sinon');

const NotificationService = require('../../../services/notificationService');
const UnitTest = require('../unitTest');
let notification, webpush;

describe('[UNIT] notificationService', function() {
    before(function() {
        UnitTest.Setup();
        UnitTest.SetDbConfig([{
            key: 'Notifications.Email',
            value: 'email'
        }, {
            key: 'Notifications.PublicKey',
            value: 'public_key'
        }, {
            key: 'Notifications.PrivateKey',
            value: 'private_key'
        }]);

        webpush = {
            setVapidDetails: sinon.stub()
        };
        notification = new NotificationService(UnitTest.Root, webpush);
    });

    it('should export service', function() {
        NotificationService.should.be.a('Function');
    });

    describe('#start()', function() {
        it('should attempt to setup the push notifications service worker', async function() {
            // setup
            const app = {
                use: sinon.stub()
            };
            await notification.start(app);
            // assert
            webpush.setVapidDetails.calledWith('email', 'public_key', 'private_key');
            app.use.calledWith(sinon.match.func);
        });
    });
});