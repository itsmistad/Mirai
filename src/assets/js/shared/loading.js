let ready;

setTimeout(() => {
    if (!ready) {
        $(selectors.loading.img).removeClass(classes.hidden);
    }
}, 500);

$(function() {
    ready = true;
    if ($(selectors.loading.container).is(':visible')) {
        setTimeout(() => {
            setTimeout(() => {
                $(selectors.loading.img).addClass(classes.hidden);
            }, 200);
            setTimeout(() => {
                $(selectors.loading.container).hide();
            }, 360);
            $(selectors.loading.container).addClass(classes.hidden);
        }, 100);
    }
});