'use strict';

let mongo;

class FriendRequestSendHandler {
    constructor(root) {
        this.event = 'friendRequestSend';
        mongo = root.mongo;
    }

    async handle(io, otherUsers, currentUser, data) {
        if (!currentUser.googleId || !data || !data.email || data.email === currentUser.email)
            return;

        let userObj = await mongo.find('users', {
            googleId: currentUser.googleId
        });
        let targetUserObj = await mongo.find('users', {
            email: data.email
        });

        if (!targetUserObj) {
            currentUser.client.emit('friendRequestSendError', {
                message: 'There\'s no user with that email.'
            });
            return;
        }

        if (targetUserObj.googleId === currentUser.googleId) {
            currentUser.client.emit('friendRequestSendError', {
                message: 'You cannot send yourself a friend request :(.'
            });
            return;
        }

        let requestObj = await mongo.find('friend_requests', {
            senderId: currentUser.googleId,
            recipientId: targetUserObj.googleId
        });

        if (requestObj) {
            currentUser.client.emit('friendRequestSendError', {
                message: 'This user already has a pending request from you.'
            });
            return;
        }

        let friendsObj = await mongo.find('friends', {
            userId: currentUser.googleId
        });
        if (friendsObj && friendsObj.friendIds.find(_ => _ === targetUserObj.googleId)) {
            currentUser.client.emit('friendRequestSendError', {
                message: 'This user is already your friend.'
            });
            return;
        }

        currentUser.client.emit('friendRequestSent');

        await mongo.save('friend_requests', {
            senderId: currentUser.googleId,
            recipientId: targetUserObj.googleId
        });

        let connectedUser = otherUsers.find(_ => _.googleId === targetUserObj.googleId);
        if (connectedUser) {
            connectedUser.client.emit('friendRequestReceived', {
                id: currentUser.googleId,
                fullName: userObj.fullName,
                displayName: userObj.displayName
            });
        }
    }
}

module.exports = FriendRequestSendHandler;