import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/theme-cookie.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/leaflet/map.js';
import 'https://cdn.kernvalley.us/components/leaflet/marker.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import 'https://cdn.kernvalley.us/components/ad/block.js';
import 'https://cdn.kernvalley.us/components/weather/current.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { $, ready, sleep } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { importGa, externalHandler, mailtoHandler, telHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { stateHandler, locate } from './handlers.js';
import { site, GA } from './consts.js';

$(document.documentElement).toggleClass({
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
});

requestIdleCallback(() => {
	if (typeof GA === 'string' && GA.length !== 0) {
		importGa(GA).then(async ({ ga }) => {
			ga('create', GA, 'auto');
			ga('set', 'transport', 'beacon');
			ga('send', 'pageview');

			await ready();

			$('a[rel~="external"]').click(externalHandler, { passive: true, capture: true });
			$('a[href^="tel:"]').click(telHandler, { passive: true, capture: true });
			$('a[href^="mailto:"]').click(mailtoHandler, { passive: true, capture: true });
		});
	}
});

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

Promise.allSettled([
	ready(),
]).then(async () => {
	init().catch(console.error);

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

		document.getElementById('search-items').append(...[...new Set([...document.querySelectorAll('leaflet-marker[title]')].map(({ title }) => title))].map(name => {
			const option = document.createElement('option');
			option.textContent = name;
			return option;
		}));
	}

	$('#locate-btn').click(locate);
	$('.no-submit').submit(event => event.preventDefault());

	$('leaflet-marker[data-postal-code]').on('open', ({ target }) => {
		sleep(200).then(() => $('leaflet-map').attr({ zoom: 17 }));
		$('weather-current').attr({ postalcode: target.dataset.postalCode }).then($els => $els.first.update());
	});

	$('leaflet-marker[id]').on('open', ({target}) => {
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

			const matches = markers.filter(el => el.title.toLowerCase().includes(value));
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

	requestIdleCallback(() => {
		$('leaflet-marker[maxzoom]').each(el => el.dataset.maxZoom = el.maxZoom);
		$('leaflet-marker[minzoom]').each(el => el.dataset.minZoom = el.minZoom);
	});
});
