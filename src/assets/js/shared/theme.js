/*
 * Mirai's Theme Selectors
 */
let selectors = {
    layout: {
        header: '#layout__header',
        main: '#layout__main',
        footer: '#layout__footer',
    },
    loading: {
        container: '#loading__container',
        img: '#loading__img'
    },
    home: {
        mainBanner: '#home__main-banner',
        lowerContent: '#home__lower-content'
    }
};
loadingSelector = selectors.loading.container;

/*
 * Mirai's Theme Colors
 */
const color = {
    lightAccent: '#ddd0f1',
    darkAccent: '#b9a3db',
    header: '#1e1b1e',
    body: '#2B2B2B',
    links: '#68adef',
    highlighted: '#2191fb',
    background: '#EFF3FA',
    error: '#ba274a'
};

/*
 * Mirai's Shared Classes
 * ----------------------
 * This object exists for programmatic purposes.
 * If you ever need to insert an element programmatically,
 * it's easier to use shared classes rather than
 * define the same styles over-and-over.
 */
let classes = {
    bold: 'bold',
    fullCenter: 'full-center',
    fullFrame: 'full-frame',
    fullViewHeight: 'full-view-height',
    fullWidth: 'full-width',
    hidden: 'hidden',
    hideScroll: 'hide-scroll',
    lower: 'lower',
    spaced: 'spaced',
    textCenter: 'text-center',
    textLeft: 'text-left',
    textRight: 'text-right',
    upper: 'upper'
};

// Toggles the scrollbar for a specified JQuery element.
function toggleScrollBar($e) {
    $e.toggleClass('hide-scroll');
}

$(function() {
    const textBoxes = $('input[type="text"], input[type="email"], textarea');
    textBoxes.each(function() {
        if (!$(this).attr('value'))
            $(this).attr('value', '');
    });
    textBoxes.change(function() {
        $(this).attr('value', $(this).val());
    });
    textBoxes.each(function() {
        if ($(this).prop('required')) {
            $(this).siblings('label').append(`<span style="position:absolute;right:0;left:unset;color:${color.error}">*</span>`);
        }
    });
});