let ready;

setTimeout(() => {
    if (!ready) {
        $('#loading-img').removeClass('hidden');
    }
}, 500);

$(function() {
    ready = true;
    if ($('#loading-container').is(':visible')) {
        $('#loading-container').fadeOut(400);
        $('body').removeClass('hidden');
    }
});