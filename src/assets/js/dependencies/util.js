/*
 * This utility file does not and should not contain anything Mirai specific!
 */

/*
 * Global Variables
 */
let hooks = {
    scroll: [],
    resize: []
};
let loadingSelector;

/*
 * Global Functions
 */
// Starts the transition to a white screen.
function startLoaderTransition(callback) {
    $(loadingSelector).fadeIn(150);
    setTimeout(() => callback(), 350);
}

// Transitions smoothly to a white screen before redirecting to the specified url.
function redirect(url) {
    startLoaderTransition(() => window.location.replace(url));
}

/*
 * On-Ready
 */
$(function() {
    /*
     * On-Scroll
     */
    const doc = $(document);
    doc.on('scroll', function() {
        const w = $(window);
        const event = {
            position: {
                top: doc.scrollTop(), // The position of the top of the window -- this increases as you scroll down.
                bottom: doc.outerHeight() - doc.scrollTop() - w.height(), // The position of the bottom of the window -- this decreases as you scroll down.
            }
        };
        for (const h in hooks.scroll) {
            h.callback(event);
        }
    });
    doc.on('resize', function() {
        const w = $(window);
        const event = {
            size: {
                width: w.width(),
                height: h.height(),
            }
        };
        for (const h in hooks.resize) {
            h.callback(event);
        }
    });
});

/*
 * JQuery Extensions
 */
jQuery.fn.extend({
    scroll: function(callback) {
        return this.each(function() {
            if (!hooks.scroll.find(_ => _.$.id == this.id))
                hooks.scroll.push({
                    $: this,
                    callback
                });
        });
    },
    resize: function(callback) {
        return this.each(function() {
            if (!hooks.resize.find(_ => _.$.id == this.id))
                hooks.resize.push({
                    $: this,
                    callback
                });
        });
    }
});