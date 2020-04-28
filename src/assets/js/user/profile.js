let editing = false, previousValues = [];

function getMutuals(a, b,) {
    let res = [], intersections = [];
    for (let i = 0; i < a.length; i++) {
        res.push(a[i]);
    } 
    for (let i = 0; i < b.length; i++) {
        if (res.find(_ => _.googleId === b[i].googleId))
            intersections.push(b[i].googleId);
    }
    for (let i = 0; i < res.length; i++) {
        if (!intersections.includes(res[i].googleId))
            res.splice(i, 1);
    }
    return res;
}

function setMutualsText() {
    if (paramUser.friends &&
        paramUser.friends.length &&
        paramUser.googleId !== user.googleId &&
        user.friends &&
        user.friends.length) {
        let mutuals = getMutuals(paramUser.friends, user.friends);
        if (mutuals.length > 0)
            $('#profile__friends-text').text(`You have ${mutuals.length} mutual${mutuals.length > 1 ? 's' : ''} with ${paramUser.displayName || paramUser.firstName}.`);
        return mutuals;
    }
}

function setFriendsText() {
    if (paramUser.googleId === user.googleId &&
        user.friends &&
        user.friends.length) {
            $('#profile__friends-text').text(`You have ${user.friends.length} friend${user.friends.length > 1 ? 's' : ''}.`);
            let index = 0;
            for (let friend of user.friends) {
                if (index <= 14) {
                    addFriend(friend);
                    index++;
                } else break;
            }
    } else if (paramUser.googleId === user.googleId && user.friends && user.friends.length === 0){
        $('#profile__friends-text').text('You currently have no friends. 🙁');
    }
}

function addFriend(friend) {
    if (!$(`#profile__friend-${friend.googleId}`).length) {
        $('#profile__friends-content').append(`
            <div id="profile__friend-${friend.googleId}" class="profile__friend">
                <div class="picture">
                    <img src="${friend.picture}" />
                </div>
            </div>`);
        contextly.init(`#profile__friend-${friend.googleId}`, 'body', [{
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
                            user.friends.splice(user.friends.findIndex(_ => _.googleId === friend.googleId), 1);
                            $(`#profile__friend-${friend.googleId}`).remove();
                            setFriendsText();
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

function registerRequestsButtonClick() {
    $('#profile__friends-requests').click(function() {
        redirect('/user/friends');
    });
}

if (!paramUser.googleId)
    redirect('/');

$(function() {
    $('#profile__picture').attr('src', paramUser.picture);
    if (paramUser.banner && paramUser.banner.trim().length)
        $('#profile__banner').css('background', `url("${paramUser.banner}") no-repeat center center`);
    $('#profile__banner').css('background-size', 'cover');
    $('#profile__about__email span').text(paramUser.email);
    if (paramUser.job && paramUser.job.trim().length) {
        $('#profile__about__job span').text(paramUser.job);
        $('#profile__about__job').show();
    }
    if (paramUser.employer && paramUser.employer.trim().length) {
        $('#profile__about__employer span').text(paramUser.employer);
        $('#profile__about__employer').show();
    }
    if (paramUser.location && paramUser.location.trim().length) {
        $('#profile__about__location span').text(paramUser.location);
        $('#profile__about__location').show();
    }
    if (paramUser.displayName && paramUser.displayName.trim().length) {
        $('#profile__display-name').text(paramUser.displayName);
    } else 
        $('#profile__display-name').addClass('full-hidden');
    if (paramUser.cardsInProfile) {
        $('#profile__cards').html(`<p>${paramUser.googleId === user.googleId ? 'You aren\'t' : (paramUser.displayName || paramUser.firstName) + ' isn\'t'} currently working on any cards.</p>`);
    }
    else
        $('#profile__cards').html(`<p>${paramUser.googleId === user.googleId ? 'You have' : (paramUser.displayName || paramUser.firstName) + ' has'} hidden this section.</p>`);
    $('#profile__projects').html(`<p>${paramUser.googleId === user.googleId ? 'You aren\'t' : (paramUser.displayName || paramUser.firstName) + ' isn\'t'} currently working on any projects.</p>`);
    $('#profile__groups').html(`<p>${paramUser.googleId === user.googleId ? 'You aren\'t' : (paramUser.displayName || paramUser.firstName) + ' isn\'t'} currently in any groups.</p>`);
    if (paramUser.friends && paramUser.friends.length) { // If the paramUser has friends...
        if (paramUser.googleId === user.googleId) { // If we are the paramUser...
            // Populate list of friends by picture icons.
            // Clicking each picture icon will bring up a notify.me of that person's info. Clicking the hyperlink will direct to their profile.
            // Clicking "See More" will open a notify.me of the entire list of friends.
            registerRequestsButtonClick();
        } else { // If we are not the paramUser...
            if (!user.friends || !user.friends.length)
                $('#profile__friends-text').text(`You have no mutuals with ${paramUser.displayName || paramUser.firstName}.`);
            $('#profile__friends-requests').hide();
        }
    } else if (paramUser.googleId === user.googleId) {
        $('#profile__friends-text').text('You currently have no friends. 🙁');
        registerRequestsButtonClick();
    } else {
        $('#profile__friends-text').text(`You have no mutuals with ${paramUser.displayName || paramUser.firstName}.`);
        $('#profile__friends-requests').hide();
    }

    if (!user.googleId || paramUser.googleId !== user.googleId) {
        $('#profile__edit-button').attr('disabled', true);
        $('#profile__edit-button').hide();
        $('#profile__friends-header').text('Mutuals');
    }

    const editIcon = 'edit-save';
    const anim = lottie.loadAnimation({
        container: document.querySelector('#profile__edit-button'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/files/lottie/${editIcon}.json`,
        initialSegment: [18, 45]
    });
    anim.setSpeed(2.8);
    $('#profile__edit-button').click(function() {
        editing = !editing;
        if (editing) {
            anim.setDirection(1);
            anim.play();
            $(this).attr('disabled', true);
            $('#profile__about ul').find('span').each(function() {
                let liParent = $(this).parent();
                liParent.show();
                $(this).css('overflow-x', 'unset');
                previousValues.push({
                    name: $(this).attr('name'),
                    value: $(this).text()
                });
                $(this).html(`
                    <div class="textbox" style="transform:translateY(0.7em);">
                        <input type="${$(this).attr('name') === 'Email Address' ? 'email' : 'text'}" name="${$(this).parent().attr('id')}-input" autocomplete="on" value="${$(this).text()}">
                        <label for="${$(this).parent().attr('id')}-input">
                            <span>${$(this).attr('name')}</span>
                        </label>
                    </div>
                `);
                initializeTextboxes();
            });
            $('#profile__banner-overlay').removeClass('full-hidden');
            $('#profile__picture-overlay').removeClass('full-hidden');
            previousValues.push({
                id: 'profile__display-name',
                value: $('#profile__display-name').text()
            });
            $('#profile__display-name').addClass('full-hidden');
            $('#profile__display-name-input').parent().removeClass('full-hidden');
            $('#profile__banner-overlay').click(function() {
                $('#profile__banner-file').click();
            });
            $('#profile__picture-overlay').click(function() {
                $('#profile__picture-file').click();
            });
            $('#profile__display-name-input').attr('value', $('#profile__display-name').text());
            $('#profile__banner-file').change(function(e) {
                var file = $(this)[0].files[0];
                if (!file) return;
                // Check file.size and file.type
                $('#profile__banner-overlay').addClass('show');
                upload.form(`/user/upload/banner?googleId=${paramUser.googleId}`, '#profile__banner-form', '#profile__banner-overlay', res => {
                    if (res.filePath) {
                        $('#profile__banner').css('background', `url("${res.filePath}") no-repeat center center`);
                        $('#profile__banner').css('background-size', 'cover');
                    } else {
                        notify.me({
                            header: 'Uh oh',
                            subheader: 'Something went wrong',
                            body: 'We weren\'t able to upload and update your banner. Please try again later.',
                            buttons: [{
                                text: 'Ok',
                                class: 'small',
                                close: true
                            }]
                        })
                    }
                    $('#profile__banner-overlay').removeClass('show');
                });
            });
            $('#profile__picture-file').change(function(e) {
                var file = $(this)[0].files[0];
                if (!file) return;
                // Check file.size and file.type
                $('#profile__picture-overlay').addClass('show');
                upload.form(`/user/upload/picture?googleId=${paramUser.googleId}`, '#profile__picture-form', '#profile__picture-overlay', res => {
                    if (res.filePath) {
                        $('#profile__picture').attr('src', res.filePath);
                        $('#header__button-login img').attr('src', res.filePath);
                    } else {
                        notify.me({
                            header: 'Uh oh',
                            subheader: 'Something went wrong',
                            body: 'We weren\'t able to upload and update your profile picture. Please try again later.',
                            buttons: [{
                                text: 'Ok',
                                class: 'small',
                                close: true
                            }]
                        })
                    }
                    $('#profile__picture-overlay').removeClass('show');
                });
            });
            $(this).attr('disabled', false);
        } else {
            if ($('#profile__about__email span input').is(':invalid') || !$('#profile__about__email span input').attr('value').length || !$('#profile__about__email span input').attr('value').trim().length) {
                notify.me({
                    subheader: 'Invalid Email Address',
                    body: 'Please enter a valid email address.',
                    buttons: [{
                        text: 'Ok',
                        class: 'medium',
                        close: true,
                        action: () => {
                        }
                    }]
                });
                editing = true;
                return;
            } else {
                $('#profile__about ul').find('input').each(function() {
                    if (!$(this).attr('value').length || !$(this).attr('value').trim().length) {
                        let liParent = $(this).parent().parent().parent();
                        
                        liParent.hide();
                    }
                });
                anim.setDirection(-1);
                anim.play();
                $(this).attr('disabled', true);
                let shouldSave = false;
                let previousVal, val;
                $('#profile__about ul').find('span').each(function() {
                    if (!$(this).attr('name')) return;
                    $(this).css('overflow-x', 'scroll');
                    val = $(this).find(`input[name="${$(this).parent().attr('id')}-input"]`).attr('value').trim();
                    previousVal = previousValues.find(_ => _.name === $(this).attr('name')).value.trim();
                    if (previousVal !== val) {
                        if (paramUser.googleId === user.googleId) {
                            $(this).text(val);
                            shouldSave = true;
                        } else {
                            $(this).text(previousVal);
                        }
                    } else {
                        $(this).text(previousVal);
                    }
                });
                val = $('#profile__display-name-input').attr('value').trim();
                previousVal = previousValues.find(_ => _.id === 'profile__display-name').value.trim();
                if (previousVal !== val) {
                    if (paramUser.googleId === user.googleId) {
                        $('#profile__display-name').text(val);
                        shouldSave = true;
                    } else {
                        $('#profile__display-name').text(previousVal);
                    }
                } else {
                    $('#profile__display-name').text(previousVal);
                }
                if (shouldSave) {
                    network.post(`/user/upload/about?googleId=${paramUser.googleId}`, {
                        email: $('#profile__about__email').text(),
                        job: $('#profile__about__job').text(),
                        employer: $('#profile__about__employer').text(),
                        location: $('#profile__about__location').text(),
                        displayName: $('#profile__display-name').text()
                    }, () => {}, true);
                }
                if ($('#profile__display-name').text().trim().length > 0)
                    $('#profile__display-name').removeClass('full-hidden');
                $('#profile__display-name-input').parent().addClass('full-hidden');
                $('#profile__banner-overlay').addClass('full-hidden');
                $('#profile__picture-overlay').addClass('full-hidden');
                $('#profile__banner-overlay').off('click');
                $('#profile__picture-overlay').off('click');
                $('#profile__banner-overlay').off('change');
                $('#profile__picture-overlay').off('change');
                $(this).attr('disabled', false);
            }
        }
    });

    if (getCookie('profile__help') !== 'true' && paramUser.googleId === user.googleId) {
        notify.me({
            header: 'Your Profile',
            body: 'What you\'re viewing is your public profile.<br/>To make changes, click the edit button in the top right.<br/>You can also change what the public can see within your <a href="/user/preferences">preferences</a>.',
            closeButton: false,
            buttons: [{
                text: 'Ok',
                class: 'medium',
                close: true,
                action: () => {
                    setCookie('profile__help', 'true', 7);
                }
            }]
        });
    }
});

function getDateFromCardDateTime(c) {
    let dateArray = c.date.split(/\D/);
    let timeArray = c.time.split(':');
    let date;
    if (c.time)
        date = new Date(dateArray[0], --dateArray[1], dateArray[2], timeArray[0], timeArray[1], 0);
    else
        date = new Date(dateArray[0], --dateArray[1], dateArray[2], 10, 0, 0);
    return date;
}

function addCardsSectionNode(c) {
    let date = getDateFromCardDateTime(c);
    let tomorrowDate = new Date();
    let todayDate = new Date(tomorrowDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    let isDueToday = date.getFullYear() === todayDate.getFullYear() &&
        date.getMonth() === todayDate.getMonth() &&
        date.getDate() === todayDate.getDate();
    let isDueTomorrow = date.getFullYear() === tomorrowDate.getFullYear() &&
        date.getMonth() === tomorrowDate.getMonth() &&
        date.getDate() === tomorrowDate.getDate();
    let time;
    let minutes = date.getMinutes() + '';
    if (date.getMinutes() < 10)
        minutes = '0' + minutes;
    if (date.getHours() === 0)
        time = `12:${minutes} AM`;
    else if (date.getHours() < 12 && date.getHours() > 0)
        time = `${date.getHours()}:${minutes} AM`;
    if (date.getHours() >= 12) 
        time = `${date.getHours() - 12}:${minutes} PM`;
    let addingDate = new Date(date);
    let previousNode;
    let children = $('#profile__cards').children('.profile__cards__node');
    children.each(function() {
        let targetDate = new Date($(this).attr('dateTime'));
        if (addingDate >= targetDate) {
            previousNode = $(this).attr('id');
        }
    });
    let html = `
        <div id="profile__cards__node__${c.id}" class="profile__cards__node banner" dateTime="${date}">
            <span class="name">
                ${c.name}
            </span>
            <span class="due-date-time">
                ${isDueToday ? 'Today' : (isDueTomorrow ? 'Tomorrow' : (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear())}${c.time ? ' at ' + time : ''}
            </span>
        </div>`
    if (!$('#profile__cards').children('.profile__cards__node').length) {
        $('#profile__cards').empty();
        $('#profile__cards').append(html);
    } else if (previousNode) {
        $('#' + previousNode).after(html);
    } else {
        $('#profile__cards').prepend(html);
    }
}

network.on('friendsLoadComplete', friends => {
    user.friends = friends;
    setMutualsText();
    setFriendsText();
}).on('profileLoadComplete', profile => {
    for (let card of profile.cards)
        if (card.date)
            addCardsSectionNode(card);

    if (profile.friends && profile.friends.length) {
        paramUser.friends = profile.friends;
        let mutuals = setMutualsText();
    
        if (mutuals)
            for (let friend of mutuals)
                addFriend(friend);
    }
    startSaving = true;
}).send('profileLoad', {
    googleId: paramUser.googleId
}).send('friendsLoad');