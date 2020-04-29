function addFriend(friend) {
    if (!$(`#friends__friend-${friend.googleId}`).length) {
        $('#friends__current-friends').append(`
            <div id="friends__friend-${friend.googleId}" class="friends__friend">
                <div class="picture">
                    <img src="${friend.picture}" />
                </div>
                <span class="name">${friend.displayName || friend.fullName}</span>
            </div>`);
        $(`#friends__friend-${friend.googleId}`).hover(function() {
            $(this).addClass('banner');
        }, function() {
            $(this).removeClass('banner');
        })
        contextly.init(`#friends__friend-${friend.googleId}`, 'body', [{
            text: 'View Profile',
            href: `/user/profile?googleId=${friend.googleId}`,
            action: e => {
                redirect(`/user/profile?googleId=${friend.googleId}`)
            }
        }, {
            text: 'Remove Friend',
            action: e => {
                notify.me({
                    header: 'Remove Friend',
                    subheader: friend.fullName,
                    body: `Would you like to remove <strong>${friend.fullName}</strong> from your friends list?`,
                    buttons: [{
                        text: 'Yes',
                        class: 'medium',
                        close: true,
                        action: () => {
                            network.send('friendRemove', {
                                userId: friend.googleId
                            });
                            $(`#friends__friend-${friend.googleId}`).remove();
                        }
                    }, {
                        text: 'No',
                        class: 'medium',
                        close: true,
                        action: () => {}
                    }]
                })
            }
        }], {
            minHeight: 100,
            showOnLeftClick: true
        });
    }
}

function addFriendRequest(request) {
    if (!$(`#friends__request-${request.id}`).length) {
        $('#friends__current-requests').append(`
            <div id="friends__request-${request.id}" class="friends__request banner">
                <div class="names">
                    <span class="full-name">${request.fullName}</span>
                    ${request.displayName ? '<span class="display-name">(' + request.displayName + ')</span>' : ''}
                </div>
                <div class="request-buttons">
                    <span class="accept"><i class="fas fa-check-circle"></i></span>
                    <span class="decline"><i class="fas fa-times-circle"></i></span>
                </div>
            </div>`);

        $(`#friends__request-${request.id} .accept`).click(function() {
            network.send('friendRequestAccept', {
                senderId: request.id
            });
            notify.me({
                subheader: 'Accepted Friend Request',
                body: `Added <strong>${request.fullName}</strong> to your friends list.`,
                buttons: [],
                timeout: 2000,
                queue: true
            });
            $(`#friends__request-${request.id}`).remove();
        });
        $(`#friends__request-${request.id} .decline`).click(function() {
            notify.me({
                header: 'Decline Friend Request',
                subheader: request.fullName,
                body: `Are you sure you want to decline <strong>${request.fullName}</strong>'s friend request?`,
                buttons: [{
                    close: true,
                    text: 'Yes',
                    class: 'medium',
                    action: () => {
                        network.send('friendRequestDecline', {
                            senderId: request.id
                        });
                        notify.me({
                            subheader: 'Declined Friend Request',
                            body: `Declined <strong>${request.fullName}</strong>'s friend request.`,
                            buttons: [],
                            timeout: 2000,
                            queue: true
                        });
                        $(`#friends__request-${request.id}`).remove();
                    }
                }, {
                    close: true,
                    text: 'No',
                    class: 'medium',
                    action: () => {}
                }]
            });
        });
    }
}

$(function() {
    $('button').not('selected').not('#friends__send-request').click(function() {
        $('button.selected').removeClass('selected');
        $(this).addClass('selected');
    });
    $('#friends__send-request').click(function() {
        let errorElement = $('#friends__send-request-error');
        if (errorElement.is(':visible'))
            errorElement.fadeOut(100);
        setTimeout(() => {
            errorElement.text('');
            network.on('friendRequestSendError', error => { 
                errorElement.text(error.message);
                errorElement.fadeIn(100);
            }).on('friendRequestSent', () => {
                notify.me({
                    header: 'Success!',
                    body: 'Your request was sent successfully!',
                    buttons: [{
                        text: 'Ok',
                        class: 'medium',
                        action: () => {

                        },
                        close: true
                    }]
                });
            }).send('friendRequestSend', {
                email: $('#friends__request-email-input').val().toLowerCase()
            });
        }, 100);
    });
    $('#friends__menu-requests').click(function() {
        $('#friends__content-requests').css('display','flex');
        $('#friends__content-friends').hide();
        $('#friends__content-blocked').hide();
    });
    $('#friends__menu-friends').click(function() {
        $('#friends__content-friends').css('display','flex');
        $('#friends__content-requests').hide();
        $('#friends__content-blocked').hide();
    });
});

network.on('friendAdded', function(friend) {
    addFriend(friend);
}).on('friendsLoadComplete', function(friends) {
    for (let friend of friends)
        addFriend(friend);
}).on('friendRequestReceived', function(request) {
    addFriendRequest(request);
}).on('friendRequestsLoadComplete', function(requests) {
    for (let request of requests)
        addFriendRequest(request);
}).send('friendRequestsLoad').send('friendsLoad');