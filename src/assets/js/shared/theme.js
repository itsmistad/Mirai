/*
 * theme.js
 * 
 * This script contains a collection of all the Mirai-specific variables and functions
 * that are used by the application for the theme of the website.
 */

/*
 * Mirai's Theme Selectors
 */
let selector = {
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
loadingSelector = selector.loading.container;

/*
 * Mirai's Theme Variables
 */
const layer = {
    loadingScreen: 10000
};

const color = {
    lightAccent: '#ddd0f1',
    accent: '#A589D1',
    darkAccent: '#8664BA',
    header: '#1e1b1e',
    body: '#2B2B2B',
    links: '#68adef',
    highlighted: '#2191fb',
    background: '#F2F3F4',
    success: '#27BA56',
    error: '#ba274a'
};

const font = {
    header: "'Montserrat', Arial",
    body: "'Roboto', 'Courier New'",
    quote: "'Courier New'"
};

const transition = {
    smooth: "200ms cubic-bezier(.4,.0,.23,1)",
    smoothSlower: "350ms cubic-bezier(.4,.0,.6,1)"
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
    column: 'column',
    columnReverse: 'column-reverse',
    fullCenter: 'full-center',
    fullFrame: 'full-frame',
    fullHidden: 'full-hidden',
    fullViewHeight: 'full-view-height',
    fullWidth: 'full-width',
    hidden: 'hidden',
    hideScroll: 'hide-scroll',
    left: 'left',
    lower: 'lower',
    right: 'right',
    required: 'required',
    row: 'row',
    rowReverse: 'row-reverse',
    spaced: 'spaced',
    stretch: 'stretch',
    textCenter: 'text-center',
    textLeft: 'text-left',
    textRight: 'text-right',
    upper: 'upper'
};

/*
 * Mirai's Theme Functions
 */
// Toggles the scrollbar for a specified JQuery element.
function toggleScrollBar($e) {
    $e.toggleClass(classes.hideScroll);
}

$(function() {
    $('#header__button-logo').click(function(e) {
        redirect('/');
        e.preventDefault();
        return;
    });
    $('#footer__button-github').click(function(e) {
        e.preventDefault();
        redirect('https://github.com/itsmistad/Mirai');
        return;
    });
    const textBoxes = $('input[type="text"], input[type="email"], textarea');

    // Initialized the value attribute if it's missing for each textbox.
    textBoxes.each(function() {
        if (!$(this).attr('value'))
            $(this).attr('value', '');
    });

    // Updates the avlue attribute for each textbox on-change.
    textBoxes.change(function() {
        $(this).attr('value', $(this).val());
    });
 
    // Adds an asterick next to any textbox that is marked as required.
    textBoxes.each(function() {
        if ($(this).prop('required')) {
            $(this).siblings('label').append(`<span class="${classes.required}">*</span>`);
        }
    });

    // If the page is loaded from browserSync, track changes to textbox values over-the-network.
    if (window.location.href.includes('3001')) {
        setInterval(() => {
            const textBoxes = $('input[type="text"], input[type="email"], textarea');
            textBoxes.each(function() {
                if ($(this).attr('value') !== $(this).val())
                    $(this).attr('value', $(this).val());
            });
        }, 250);
    }

    // Prevents anchor elements from immediately redirecting. Replaces the behavior with a smooth transition.
    $('a').click(function(e) {
        e.preventDefault();
        if ($(this).attr('href')) redirect($(this).attr('href'));
        return false;
    });
});

notify.initSound('default', '/files/notify.mp3');