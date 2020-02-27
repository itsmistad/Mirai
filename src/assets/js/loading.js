let ready;

setTimeout(() => {
    if (!ready) {
        $('#loading-img').removeClass('hidden');
    }
}, 500);

$(function() {
    ready = true;
    if ($('#loading-container').is(':visible')) {
        setTimeout(() => {
            $('#loading-container').fadeOut(300);
            setTimeout(() => {
                $('#loading-img').addClass('hidden');
                $('body').removeClass('hidden');
            }, 320);
        }, 100);
    }
});