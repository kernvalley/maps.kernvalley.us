import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://unpkg.com/@webcomponents/custom-elements@1.3.2/custom-elements.min.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/leaflet/map.js';
import 'https://cdn.kernvalley.us/components/leaflet/marker.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import { $, ready } from 'https://cdn.kernvalley.us/js/std-js/functions.js';

document.documentElement.classList.replace('no-js', 'js');
document.body.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
document.body.classList.toggle('no-details', document.createElement('details') instanceof HTMLUnknownElement);

ready().then(async () => {
	const map = document.querySelector('leaflet-map');
	await map.ready;

	$('#search').input(({ target }) => {
		const value = target.value.toLowerCase();
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

	document.getElementById('search-items').append(...map.markers.map(({ title }) => {
		const item = document.createElement('option');
		item.textContent = title;
		return item;
	}));
});
