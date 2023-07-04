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
		'{{ site.data.importmap.imports["@shgysk8zer0/polyfills"] }}',
		'{{ site.data.importmap.imports["@shgysk8zer0/kazoo/"] }}harden.js',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}leaflet/map.min.js',

		/* `customElements`templates */
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}leaflet/map.html',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}github/user.html',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}pwa/prompt.html',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}weather/current.html',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}install/prompt.html',
		'{{ site.data.importmap.imports["@kernvalley/components/"] }}events.html',

		/* CSS */
		'/css/index.min.css',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}leaflet/map.css',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}github/user.css',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}pwa/prompt.css',
		'{{ site.data.importmap.imports["@kernvalley/components/"] }}ad.css',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}weather/current.css',
		'{{ site.data.importmap.imports["@shgysk8zer0/components/"] }}install/prompt.css',
		'{{ site.data.importmap.imports["@kernvalley/components/"] }}events.css',

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

