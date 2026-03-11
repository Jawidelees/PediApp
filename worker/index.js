self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();

        // Handle silent sync messages (don't show a banner)
        if (data.title === 'Sync' || data.body === 'REFRESH_APPOINTMENTS') {
            try {
                const bc = new BroadcastChannel('notifications');
                bc.postMessage({ type: 'PUSH_RECEIVED', data: data });
                bc.close();
            } catch (e) {
                console.log('BroadcastChannel error:', e);
            }
            return;
        }

        const title = data.title || 'Clínica Pediátrica';
        const body = data.body || 'Tienes una nueva notificación de tu clínica.';
        const icon = data.icon || '/icons/icon-192x192.png';
        const urlToOpen = data.url || '/patient';

        const options = {
            body: body,
            icon: icon,
            tag: urlToOpen,
            vibrate: [200, 100, 200, 100, 200, 100, 400],
            badge: '/icons/icon-192x192.png',
            renotify: true,
            requireInteraction: true,
            silent: false,
            data: { url: urlToOpen },
            actions: [
                {
                    action: 'open_url',
                    title: 'Ver Detalles',
                    icon: '/icons/icon-192x192.png'
                }
            ]
        };

        const notificationPromise = self.registration.showNotification(title, options)
            .then(() => {
                // Notificar a la app en tiempo real vía BroadcastChannel
                try {
                    const bc = new BroadcastChannel('notifications');
                    bc.postMessage({ type: 'PUSH_RECEIVED', data: data });
                    bc.close();
                } catch (e) {
                    console.log('BroadcastChannel error:', e);
                }

                if ('setAppBadge' in navigator) {
                    return navigator.setAppBadge().catch(e => console.log('AppBadge error:', e));
                }
            })
            .catch(err => console.error("Error displaying notification:", err));

        event.waitUntil(notificationPromise);
    } catch (err) {
        console.error("Critical error in push event:", err);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    try {
        if ('clearAppBadge' in navigator) {
            navigator.clearAppBadge().catch((error) => console.log('ClearAppBadge error:', error));
        }

        const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/patient';
        // Handle specific action button if clicked
        // const action = event.action; // if 'open_url' etc

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
                // Try to find a window that's already open to this URL
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no matching window is found, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(new URL(urlToOpen, self.location.origin).href);
                }
            }).catch(e => console.error(e))
        );
    } catch (e) {
        console.error("Notification click error:", e);
    }
});
