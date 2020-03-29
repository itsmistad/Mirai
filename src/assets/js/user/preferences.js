function setTheme(mode) {
    switch (mode) {
    case 0:
        $('body').addClass('dark');
        break;
    case 1:
        $('body').removeClass('dark');
        break;
    }
    saveToDatabase();
}

function saveToDatabase() {
    network.post(`/user/upload/preferences`, {
        priorityStyle: $('#preferences__priority-switch-checkbox').is(':checked'),
        nightMode: $('#preferences__night-switch-checkbox').is(':checked'),
        notifySound: $('#preferences__sound-switch-checkbox').is(':checked')
    }, () => {}, true);
}

$(function() {
    $('#preferences__night-switch-checkbox').prop('checked', user.nightMode || false);
    $('#preferences__priority-switch-checkbox').prop('checked', user.priorityStyle || false);
    if (user.notifySound == null)
        $('#preferences__sound-switch-checkbox').prop('checked', true);
    else
        $('#preferences__sound-switch-checkbox').prop('checked', user.notifySound);

    $('#preferences__browse-button').click(function() {
        $('#preferences__background-browse').click();
    });

    $('#preferences__background-browse').change(function() {
        let file = $(this)[0].files[0];
        $('#preferences__browse-label').text(file.name);

        let reader = new FileReader();
        reader.onload = function(e) {
            $('#preferences__background-browse-image').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
        // saveToDatabase();
    });

    $('#preference__priority-switch-checkbox').click(function() {
        saveToDatabase();
    });

    $('#preferences__night-switch-checkbox').click(function() {
        if ($(this).is(":checked")) {
            notify.me({
                header: 'The time has come.',
                buttons: [{
                    text: 'Execute Order 66',
                    close: true
                }],
                onStartClose: () => setTheme(0)
            });
        } else {
            notify.me({
                header: 'Hello there.',
                buttons: [{
                    text: 'General Kenobi',
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

    $('#preferences__reset-button').click(function() {
        $('#preferences__priority-switch-checkbox').prop('checked', false);
        $('#preferences__night-switch-checkbox').prop('checked', false);
        $('#preferences__sound-switch-checkbox').prop('checked', true);
        $('#preferences__background-browse').val('');
        $('#preferences__background-browse-image').attr('src', '');
        $('#preferences__browse-label').text('');
        saveToDatabase();
    });
});