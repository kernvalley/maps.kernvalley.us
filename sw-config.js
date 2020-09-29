/* eslint no-unused-vars: 0 */
/* eslint-env serviceworker */

const config = {
	version: '1.1.7',
	fresh: [
		'/'
	].map(path => new URL(path, location.origin).href),
	stale: [
		'/js/index.min.js',
		'/css/index.min.css',
		'/img/icons.svg',
		'https://cdn.polyfill.io/v3/polyfill.min.js',
		'https://cdn.kernvalley.us/components/leaflet/map.html',
		'https://cdn.kernvalley.us/components/leaflet/map.css',
		'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
		'https://cdn.kernvalley.us/components/github/user.html',
		'https://cdn.kernvalley.us/components/github/user.css',
		'https://cdn.kernvalley.us/components/pwa/prompt.html',
		'https://cdn.kernvalley.us/components/pwa/prompt.css',
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/toast-message.css',
		'https://cdn.kernvalley.us/img/octicons/organization.svg',
		'https://cdn.kernvalley.us/img/keep-kern-clean.svg',
		'/img/apple-touch-icon.png',
		'/img/icon-16.png',
		'/favicon.ico',
		'/img/icon-32.png',
		'/img/icon-192.png',
		'/img/favicon.svg',
		'/img/markers/bar.svg',
		/* Social Icons for Web Share API shim */
		'https://cdn.kernvalley.us/img/octicons/mail.svg',
		'https://cdn.kernvalley.us/img/logos/facebook.svg',
		'https://cdn.kernvalley.us/img/logos/twitter.svg',
		'https://cdn.kernvalley.us/img/logos/google-plus.svg',
		'https://cdn.kernvalley.us/img/logos/linkedin.svg',
		'https://cdn.kernvalley.us/img/logos/reddit.svg',
		'https://cdn.kernvalley.us/img/logos/gmail.svg',
		'https://cdn.kernvalley.us/img/adwaita-icons/actions/mail-send.svg',
		'https://cdn.kernvalley.us/img/logos/instagram.svg',
		'https://cdn.kernvalley.us/fonts/roboto.woff2',
	].map(path => new URL(path, location.origin).href),
	allowed: [
		/https:\/\/i\.imgur\.com\/.*/,
		/https:\/\/maps\.wikimedia\.org\/osm-intl\/*/,
		/https:\/\/*\.githubusercontent\.com\/*/,
		/https:\/\/api\.github\.com\/users\/*/,
		/https:\/\/cdn\.kernvalley\.us\/img\/*/,
	],
};
