function setTheme(mode) {
    switch (mode) {
    case 0:
        $('body').addClass('dark');
        if ($('#preferences__background-browse-image').attr('src') === '/files/svg/grid.svg') {
            $('#preferences__background-browse-image').attr('src', '/files/svg/grid-black.svg');
            $('#preferences__browse-label').text('Grid');
        }
        break;
    case 1:
        $('body').removeClass('dark');
        if ($('#preferences__background-browse-image').attr('src') === '/files/svg/grid-black.svg') {
            $('#preferences__background-browse-image').attr('src', '/files/svg/grid.svg');
            $('#preferences__browse-label').text('Grid');
        }
        break;
    }
    saveToDatabase();
}

function saveToDatabase() {
    network.post(`/user/upload/preferences`, {
        priorityStyle: $('#preferences__priority-switch-checkbox').is(':checked'),
        nightMode: $('#preferences__night-switch-checkbox').is(':checked'),
        notifySound: $('#preferences__sound-switch-checkbox').is(':checked'),
        backgroundTileName: $('#preferences__browse-label').text(),
        cardsInProfile: $('#preferences__profile-cards-switch-checkbox').is(':checked')
    }, () => {}, true);
}

$(function() {
    $('#preferences__night-switch-checkbox').prop('checked', user.nightMode == null ? true : user.nightMode);
    $('#preferences__priority-switch-checkbox').prop('checked', user.priorityStyle == null ? true : user.priorityStyle);
    $('#preferences__profile-cards-switch-checkbox').prop('checked', user.cardsInProfile == null ? true : user.cardsInProfile);
    $('#preferences__sound-switch-checkbox').prop('checked', user.notifySound == null ? true : user.notifySound);
    if (user.backgroundTile) {
        $('#preferences__background-browse-image').attr('src', user.backgroundTile);
        $('#preferences__browse-label').text(user.backgroundTileName);
    } else if (!user.nightMode) {
        $('#preferences__background-browse-image').attr('src', '/files/svg/grid.svg');
        $('#preferences__browse-label').text('Grid');
    } else {
        $('#preferences__background-browse-image').attr('src', '/files/svg/grid-black.svg');
        $('#preferences__browse-label').text('Grid');
    }

    $('#preferences__browse-button').click(function() {
        $('#preferences__background-browse').click();
    });

    $('#preferences__background-browse').change(function() {
        let file = $(this)[0].files[0];
        if (!file) return;
        $('#preferences__browse-label').text(file.name);

        let reader = new FileReader();
        reader.onload = function(e) {
            $('#preferences__background-browse-image').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
        saveToDatabase();
        upload.form('/user/upload/preferences/bg', '#preferences__background-form', '#preferences__background-upload-progress', res => {
            if (!res.filePath) {
                notify.me({
                    header: 'Uh oh',
                    subheader: 'Something went wrong',
                    body: 'We weren\'t able to upload and update your background tile. Please try again later.',
                    buttons: [{
                        text: 'Ok',
                        class: 'small',
                        close: true
                    }]
                })
            }
        });
    });

    $('#preferences__priority-switch-checkbox').click(function() {
        saveToDatabase();
    });

    $('#preferences__night-switch-checkbox').click(function() {
        if ($(this).is(":checked")) {
            notify.me({
                header: 'The time has come...',
                buttons: [{
                    text: 'Execute Order 66.',
                    close: true
                }],
                onStartClose: () => setTheme(0)
            });
        } else {
            notify.me({
                header: 'Hello there.',
                buttons: [{
                    text: 'General Kenobi...',
                    close: true
                }],
                onStartClose: () => setTheme(1)
            });
        }
    });

    $('#preferences__sound-switch-checkbox').click(function() {
        if (!$(this).is(':checked')) {
            notify.removeSound('default');
        } else {
            notify.initSound('default', '/files/notify.mp3');
        }
        saveToDatabase();
    });

    $('#preferences__profile-cards-switch-checkbox').click(function() {
        saveToDatabase();
    });

    $('#preferences__reset-button').click(function() {
        $('#preferences__priority-switch-checkbox').prop('checked', false);
        $('#preferences__night-switch-checkbox').prop('checked', false);
        $('#preferences__sound-switch-checkbox').prop('checked', true);
        $('#preferences__profile-cards-switch-checkbox').prop('checked', true);
        $('#preferences__background-browse').val('');
        $('#preferences__background-browse-image').attr('src', '');
        $('#preferences__browse-label').text('');
        upload.form('/user/upload/preferences/bg', '#preferences__background-form');
        if (!user.nightMode) {
            $('#preferences__background-browse-image').attr('src', '/files/svg/grid.svg');
            $('#preferences__browse-label').text('Grid');
        } else {
            $('#preferences__background-browse-image').attr('src', '/files/svg/grid-black.svg');
            $('#preferences__browse-label').text('Grid');
        }
        saveToDatabase();
    });
});