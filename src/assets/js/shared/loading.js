/*
 * loading.js
 * 
 * This script contains a handler that fades in the interface when the document is ready.
 */

let ready, loading = [];

// If the document is still not ready after 500 ms, show the loading animation.
setTimeout(() => {
    if (!ready) {
        $(selector.loading.img).removeClass(classes.hidden);
    }
}, 500);

// Marks the loading screen as "overridden" by the given key. The loading screen will now only disappear once "finishLoading()" is called for necessary keys.
// Call this outside of a script's "$(function() {})" section to manage your own loading.
function overrideLoading(key) {
    loading.push(key);
}

// Clears out the loading screen and animation.
function finishLoading(key) {
    console.log(key);
    console.log(loading);
    if (loading.includes(key)) {
        loading.splice(loading.findIndex(_ => _ === key), 1);
        if (loading.length !== 0) return;
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
    }
}

$(function() {
    if (loading.length === 0)
        finishLoading('default');
});