$(function() {
    $('#home__banner-anchor').click(function(e) {
        e.preventDefault();
        //redirect('https://www.freepik.com/free-photos-vectors/business');
        return false;
    });
    $('#home__mirai').click(function(e) {
        e.preventDefault();
        redirect('/');
    });
    $('#home__github').click(function() {
        redirect('https://github.com/itsmistad/Mirai');
    });
    $('#home__tryit').click(function() {
        redirect('/dashboard');
    });
});