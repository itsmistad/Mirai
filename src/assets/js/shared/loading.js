let ready;

setTimeout(() => {
    if (!ready) {
        $(selector.loading.img).removeClass(classes.hidden);
    }
}, 500);

$(function() {
    ready = true;
    if ($(selector.loading.container).is(':visible')) {
        setTimeout(() => {
            setTimeout(() => {
                $(selector.loading.img).addClass(classes.hidden);
            }, 200);
            setTimeout(() => {
                $(selector.loading.container).hide();
            }, 360);
            $(selector.loading.container).addClass(classes.hidden);
        }, 100);
    }
});