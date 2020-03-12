self.addEventListener('push', e => {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
        body: 'Welcome to Mirai!',
        icon: '/files/favicon.ico'
    });
});