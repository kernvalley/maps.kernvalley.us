import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://unpkg.com/@webcomponents/custom-elements@1.4.2/custom-elements.min.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/leaflet/map.js';
import 'https://cdn.kernvalley.us/components/leaflet/marker.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import { $, ready } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { loadScript } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { importGa } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { stateHandler } from './handlers.js';
import { site, GA } from './consts.js';

document.documentElement.classList.replace('no-js', 'js');
document.body.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
document.body.classList.toggle('no-details', document.createElement('details') instanceof HTMLUnknownElement);

if (typeof GA === 'string' && GA.length !== 0) {
	importGa(GA).then(async () => {
		/* global ga */
		ga('create', GA, 'auto');
		ga('set', 'transport', 'beacon');
		ga('send', 'pageview');


		function outbound() {
			ga('send', {
				hitType: 'event',
				eventCategory: 'outbound',
				eventAction: 'click',
				eventLabel: this.href,
				transport: 'beacon',
			});
		}

		function madeCall() {
			ga('send', {
				hitType: 'event',
				eventCategory: 'call',
				eventLabel: 'Called',
				transport: 'beacon',
			});
		}

		await ready();

		$('a[rel~="external"]').click(outbound, { passive: true, capture: true });
		$('a[href^="tel:"]').click(madeCall, { passive: true, capture: true });

	});
}


if (navigator.registerProtocolHandler instanceof Function) {
	navigator.registerProtocolHandler('geo', `${location.origin}/?geo=%s`, site.title);
}

if (location.search.includes('geo=geo')) {
	const params = new URLSearchParams(location.search);

	if (params.has('geo')) {
		const geo = params.get('geo');
		if (geo.startsWith('geo:')) {
			const [latitude = NaN, longitude = NaN] = geo.substr(4).split(';', 2)[0].split(',', 2).map(parseFloat);

			if (! (Number.isNaN(latitude) || Number.isNaN(longitude))) {
				const url = new URL(location.pathname, location.origin);
				url.hash = `#${latitude},${longitude}`;

				history.replaceState({
					latitude,
					longitude,
					title: 'Location',
					body: `Coorinates: ${latitude}, ${longitude}`,
				}, `Location: ${site.title}`, url.href);
			}
		}
	}
}

Promise.all([
	ready(),
	loadScript('https://cdn.polyfill.io/v3/polyfill.min.js'),
]).then(async () => {
	if (location.pathname === '/') {
		addEventListener('popstate', stateHandler);

		Promise.all([
			customElements.whenDefined('leaflet-map'),
			customElements.whenDefined('leaflet-marker'),
		]).then(async () => {
			if (history.state === null && location.hash !== '') {
				if (location.hash.includes(',')) {
					const [latitude = NaN, longitude = NaN] = location.hash.substr(1).split(',', 2).map(parseFloat);
					history.replaceState({
						latitude,
						longitude,
						title: 'Location',
						body: `Coorinates: ${latitude}, ${longitude}`,
					}, `Location: ${site.title}`, location.href);

					stateHandler(history);
				} else {
					const marker = document.getElementById(location.hash.substr(1));

					if (marker instanceof HTMLElement && marker.tagName === 'LEAFLET-MARKER') {
						document.title = `${marker.title} | ${site.title}`;
						history.replaceState({
							title: marker.title,
							longitude: marker.longitude,
							latitude: marker.latitude,
							uuid: marker.id,
						}, document.title, location.href);

						stateHandler(history);
					}

				}
			} else if (history.state !== null) {
				stateHandler(history);
			}
		});
		const map = document.querySelector('leaflet-map');
		await map.ready;

		document.getElementById('search-items').append(...map.markers.map(({ title }) => {
			const item = document.createElement('option');
			item.textContent = title;
			return item;
		}));
	}

	$('leaflet-marker').on('open', ({target}) => {
		const url = new URL(location.pathname, location.origin);
		url.hash = `#${target.id}`;
		document.title = `${target.title} | ${site.title}`;

		if (location.hash.substr(1) !== target.id) {
			history.pushState({
				latitude: target.latitude,
				longitude: target.longitude,
				title: target.title,
				uuid: target.id,
			}, document.title, url.href);
		}
	});

	$('#search').input(async ({ target }) => {
		const value = target.value.toLowerCase();
		const map = document.querySelector('leaflet-map');
		await map.ready;

		const markers = map.markers;

		if (value !== '') {
			markers.forEach(el => {
				el.hidden = true;
				el.open = false;
			});

			const matches = markers.filter(el => el.title.toLowerCase().startsWith(value));
			matches.forEach(el => el.hidden = false);

			if (matches.length === 1) {
				matches[0].open = true;
			}
		} else {
			markers.forEach(el => el.hidden = false);
		}

	}, {
		passive: true,
	});
});
