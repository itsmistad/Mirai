function startLoaderTransition(callback) {
    $('#loading-container').fadeIn(150);
    setTimeout(() => callback(), 350);
}

function redirect(url) {
    startLoaderTransition(() => window.location.replace(url));
}