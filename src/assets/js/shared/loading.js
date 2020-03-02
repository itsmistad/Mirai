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
            $(selectors.loading.container).fadeOut(300);
            setTimeout(() => {
                $(selectors.loading.img).addClass(classes.hidden);
                $('body').removeClass(classes.hidden);
            }, 320);
        }, 100);
    }
});