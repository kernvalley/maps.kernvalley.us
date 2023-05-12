---
layout: null
---
'use strict';
/* eslint-env serviceworker */
/* eslint no-unused-vars: 0 */

const config = {
	version: '{{ site.data.app.version | default: site.version }}',
	fresh: [
		'/',
		'https://cdn.kernvalley.us/img/markers.svg',
		'/webapp.webmanifest',
		'https://events.kernvalley.us/events.json',
	].map(path => new URL(path, location.origin).href),
	stale: [
		/* JS */
		'/js/index.min.js',
		'https://unpkg.com/@shgysk8zer0/polyfills@0.0.5/all.min.js',
		'src: https://unpkg.com/@shgysk8zer0/kazoo@0.0.5/harden.js',
		'https://cdn.kernvalley.us/components/leaflet/map.min.js',

		/* `customElements`templates */
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/leaflet/map.html',
		'https://cdn.kernvalley.us/components/github/user.html',
		'https://cdn.kernvalley.us/components/pwa/prompt.html',
		'https://cdn.kernvalley.us/components/weather/current.html',
		'https://cdn.kernvalley.us/components/install/prompt.html',
		'https://cdn.kernvalley.us/components/krv/events.html',

		/* CSS */
		'/css/index.min.css',
		'https://cdn.kernvalley.us/components/toast-message.css',
		'https://cdn.kernvalley.us/components/leaflet/map.css',
		'https://cdn.kernvalley.us/components/github/user.css',
		'https://cdn.kernvalley.us/components/pwa/prompt.css',
		'https://cdn.kernvalley.us/components/krv/ad.css',
		'https://cdn.kernvalley.us/components/weather/current.css',
		'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css',
		'https://cdn.kernvalley.us/components/install/prompt.css',
		'https://cdn.kernvalley.us/components/krv/events.css',

		/* Images & Icons */
		'/img/icons.svg',
		'/img/favicon.svg',
		'/favicon.ico',
		'/img/apple-touch-icon.png',
		'/img/icon-512.png',
		'/img/icon-192.png',
		'/img/icon-32.png',
		'https://cdn.kernvalley.us/img/logos/play-badge.svg',
		'https://cdn.kernvalley.us/img/keep-kern-clean.svg',

		/* Fonts */
		'https://cdn.kernvalley.us/fonts/roboto.woff2',
		/* Other */
	].map(path => new URL(path, location.origin).href),
	allowed: [
		'https://maps.wikimedia.org/osm-intl/',
		'https://i.imgur.com/',
		'https://www.google-analytics.com/analytics.js',
		'https://www.googletagmanager.com/gtag/js',
		'https://api.github.com/users/',
		/https:\w+\.githubusercontent\.com\/u\/*/,
		/\.(png|jpg|webp|gif|svg)$/,
	],
	allowedFresh: [
		'https://api.openweathermap.org/data/',
		/\.(html|js|css|json)$/,
	]
};
