import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/theme-cookie.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/leaflet/map.js';
import 'https://cdn.kernvalley.us/components/leaflet/marker.js';
import 'https://cdn.kernvalley.us/components/leaflet/geojson.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import 'https://cdn.kernvalley.us/components/app/stores.js';
import 'https://cdn.kernvalley.us/components/ad/block.js';
import 'https://cdn.kernvalley.us/components/weather/current.js';
import 'https://cdn.kernvalley.us/components/install/prompt.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { getCustomElement } from 'https://cdn.kernvalley.us/js/std-js/custom-elements.js';
import { $ } from 'https://cdn.kernvalley.us/js/std-js/esQuery.js';
import { ready, loaded, toggleClass, on } from 'https://cdn.kernvalley.us/js/std-js/dom.js';
import { importGa, externalHandler, mailtoHandler, telHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { consumeHandler } from './functions.js';
import { GA } from './consts.js';

if ('launchQueue' in window) {
	launchQueue.setConsumer(consumeHandler);
}

toggleClass(document.documentElement, {
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
}).catch(console.error);

try {
	loaded().then(() => {
		requestIdleCallback(() => {
			if (typeof GA === 'string' && GA.length !== 0) {
				importGa(GA).then(async ({ hasGa, ga, create, set }) => {
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

if (location.search.includes('geo=geo')) {
	try {
		const params = new URLSearchParams(location.search);

		if (params.has('geo')) {
			const geo = params.get('geo');

			if (geo.startsWith('geo:')) {
				const [latitude = NaN, longitude = NaN] = geo.substr(4).split(';', 2)[0]
					.split(',', 2).map(parseFloat);

				if (! (Number.isNaN(latitude) || Number.isNaN(longitude))) {
					const url = new URL(location.pathname, location.origin);
					url.hash = `#${latitude},${longitude}`;
				}
			}
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
	})

	if (location.pathname === '/') {
		await Promise.all([
			customElements.whenDefined('leaflet-map'),
			customElements.whenDefined('leaflet-marker'),
		]);

		const map = document.querySelector('leaflet-map');
		await map.ready;

		if (location.hash.length < 2 && await map.hasGeoPermission(['granted'])) {
			map.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });
		}

		on('.no-submit', ['submit'], event => event.preventDefault());

		on('#locate-btn', ['click'], () => {
			document.querySelector('leaflet-map').locate({ maxZoom: 16 });
		});

		on('leaflet-marker[data-postal-code]', ['open'], ({ target }) => {
			document.querySelector('leaflet-map').flyTo(target, 18);
			$('weather-current').attr({ postalcode: target.dataset.postalCode }).then($els => $els.first.update());
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
