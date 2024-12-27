import '@shgysk8zer0/kazoo/theme-cookie.js';
import '@shgysk8zer0/components/current-year.js';
import '@shgysk8zer0/components/share-button.js';
import '@shgysk8zer0/components/github/user.js';
import '@shgysk8zer0/components/app/list-button.js';
import '@shgysk8zer0/components/app/stores.js';
import '@kernvalley/components/ad.js';
import '@shgysk8zer0/components/weather/current.js';
import '@shgysk8zer0/components/install/prompt.js';
import '@kernvalley/components/events.js';
import { init } from '@shgysk8zer0/kazoo/data-handlers.js';
import { getCustomElement } from '@shgysk8zer0/kazoo/custom-elements.js';
import { getGooglePolicy, getDefaultPolicy } from '@shgysk8zer0/kazoo/trust-policies.js';
import { ready, loaded, toggleClass, on, attr } from '@shgysk8zer0/kazoo/dom.js';
import { importGa, externalHandler, mailtoHandler, telHandler } from '@shgysk8zer0/kazoo/google-analytics.js';
import { decodeGeohash, parseGeoURI } from 'https://unpkg.com/@shgysk8zer0/geoutils@1.0.2/geoutils.js';
import { consumeHandler } from './functions.js';
import { addEventsToMap } from './events.js';
import { GA } from './consts.js';

getDefaultPolicy();

if ('launchQueue' in window) {
	launchQueue.setConsumer(consumeHandler);
}

toggleClass(document.documentElement, {
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
});

try {
	loaded().then(() => {
		const policy = getGooglePolicy();

		requestIdleCallback(() => {
			if (typeof GA === 'string' && GA.length !== 0) {
				importGa(GA,{}, { policy }).then(async ({ hasGa, ga, create, set }) => {
					if (hasGa()) {
						create(GA, 'auto');
						set('transport', 'beacon');
						ga('send', 'pageview');

						on('a[rel~="external"]', ['click'], externalHandler, { passive: true, capture: true });
						on('a[href^="tel:"]', ['click'], telHandler, { passive: true, capture: true });
						on('a[href^="mailto:"]', ['click'], mailtoHandler, { passive: true, capture: true });
					}
				}).catch(console.error);
			}
		});
	});
} catch(err) {
	console.error(err);
}

if (location.search.includes('geo')) {
	const params = new URLSearchParams(location.search);

	if (params.has('geo')) {
		try {
			const {
				coords: { latitude = NaN, longitude = NaN } = {},
				params: { zoom = 16 } = {},
			} = parseGeoURI(params.get('geo'));

			if (! (Number.isNaN(latitude) || Number.isNaN(longitude))) {
				const url = new URL(location.pathname, location.origin);
				url.hash = `#${latitude},${longitude},${zoom}`;
				history.replaceState(history.state, '', url.href);
			}
		} catch(err) {
			console.error(err);
		}
	} else if (params.has('geohash')) {
		try {
			const { latitude = NaN, longitude = NaN } = decodeGeohash(params.get('geohash'));

			if (! (Number.isNaN(latitude) || Number.isNaN(longitude))) {
				const url = new URL(location.pathname, location.origin);
				url.hash = `#${latitude},${longitude}`;
				history.replaceState(history.state, '', url.href);
			}
		} catch(err) {
			console.error(err);
		}
	}
	//0123456789bcdefghjkmnpqrstuvwxyz 32-bit alphabet
} else if (location.hash.length > 2 && /^#[0-9b-hjk-np-z]{2,12}$/.test(location.hash)) {
	try {
		const { latitude = NaN, longitude = NaN } = decodeGeohash(location.hash.substring(1));

		if (! (Number.isNaN(latitude) || Number.isNaN(longitude))) {
			const url = new URL(location.pathname, location.origin);
			url.hash = `#${latitude},${longitude}`;
			history.replaceState(history.state, '', url.href);
		}
	} catch(err) {
		console.error(err);
	}
}

ready().then(async () => {
	init();

	getCustomElement('install-prompt').then(HTMLInstallPromptElement => {
		on('#install-btn', ['click'], () => new HTMLInstallPromptElement().show())
			.forEach(el => el.hidden = false);
	});

	if (location.pathname === '/') {
		await Promise.all([
			customElements.whenDefined('leaflet-map'),
			customElements.whenDefined('leaflet-marker'),
		]);

		const map = document.querySelector('leaflet-map');
		addEventsToMap(map).catch(console.error);
		await map.ready;

		if (location.hash.length < 2 && await map.hasGeoPermission(['granted'])) {
			map.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });
		}

		on('.no-submit', ['submit'], event => event.preventDefault());

		on('leaflet-marker[data-postal-code]', ['open'], ({ target }) => {
			document.querySelector('leaflet-map').flyTo(target, 18);
			const weather = document.querySelector('weather-current');
			attr([weather], { postalcode: target.dataset.postalCode });
			weather.update();
		});

		on('#search', ['input'], async ({ target }) => {
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

		document.getElementById('search-items').append(...[...new Set([...map.querySelectorAll('leaflet-marker[title]')].map(({ title }) => title))].map(name => {
			const option = document.createElement('option');
			option.textContent = name;
			return option;
		}));
	}
});
