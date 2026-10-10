import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

export function getPharmacistEcho(configuration) {
    if (!configuration?.key || !configuration?.host || !configuration?.port || !configuration?.scheme) return null;

    if (!echoInstance) {
        window.Pusher = Pusher;
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: configuration.key,
            wsHost: configuration.host,
            wsPort: configuration.port,
            wssPort: configuration.port,
            forceTLS: configuration.scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
            auth: { headers: { 'X-Requested-With': 'XMLHttpRequest' } },
            withCredentials: true,
        });
    }

    return echoInstance;
}
