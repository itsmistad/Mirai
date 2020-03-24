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
        if (!user.googleId) {
            redirect('/auth/google/callback');
        } else {
            redirect('/dashboard');
        }
    });

    if (!isProd) {
        $('#home__theme-examples').show();
    }

    switch (badLogin) {
    case 1:
        notify.me({
            header: 'Login Failed',
            subheader: 'Something went wrong',
            body: 'We were unable to authenticate your login request. Please try again later.',
            queue: true,
            timeout: 5000,
            buttons: []
        });
        break;
    case 2:
        notify.me({
            header: 'Login Failed',
            subheader: 'Something went wrong',
            body: 'We were unable to complete your login request. Please try again later.',
            queue: true,
            timeout: 5000,
            buttons: []
        });
        break;
    default:
        break;
    }
});