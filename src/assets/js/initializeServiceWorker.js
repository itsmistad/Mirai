const publicVapidKey = 'BEyl9KcoySMGEMf-L70zw3vLhFSkleIImIsZP_kK6yWhpvubMYGUtwqb8G-fKy1k1WeAjGRMQKfHewF5VH_JVnY';

if ('serviceWorker' in navigator) {
    run().catch(error => console.error(error));
}

async function run() {
    const registration = await navigator.serviceWorker.
        register('/js/serviceWorker.js', {scope: '/'});
    const subscription = await registration.pushManager.
    subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'content-type': 'application/json'
        }
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}