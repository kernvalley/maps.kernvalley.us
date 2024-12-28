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

		/* CSS */
		'/css/index.min.css',
		'{{ site.data.importmap.imports["leaflet/"]}}leaflet.css',

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

