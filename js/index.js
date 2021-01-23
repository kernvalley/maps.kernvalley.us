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
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { $, ready } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { importGa, externalHandler, mailtoHandler, telHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { consumeHandler } from './functions.js';
import { GA } from './consts.js';

if ('launchQueue' in window) {
	launchQueue.setConsumer(consumeHandler);
}

$(document.documentElement).toggleClass({
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
}).catch(console.error);

try {
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
			}).catch(console.error);
		}
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

Promise.all([
	init().catch(console.error),
]).then(async () => {
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

		$('#locate-btn').click(() => {
			document.querySelector('leaflet-map')
				.locate({ maxZoom: 16 });
		});

		$('leaflet-marker[data-postal-code]').on('open', ({ target }) => {
			document.querySelector('leaflet-map').flyTo(target, 18);
			$('weather-current').attr({ postalcode: target.dataset.postalCode }).then($els => $els.first.update());
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

		document.getElementById('search-items').append(...[...new Set([...map.querySelectorAll('leaflet-marker[title]')].map(({ title }) => title))].map(name => {
			const option = document.createElement('option');
			option.textContent = name;
			return option;
		}));
	}

	$('.no-submit').submit(event => event.preventDefault());

});
