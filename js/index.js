import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/gravatar-img.js';
import 'https://cdn.kernvalley.us/components/login-button.js';
import 'https://cdn.kernvalley.us/components/logout-button.js';
import HTMLOpenStreetMapElement from 'https://cdn.kernvalley.us/components/open-street-map.js';
import { registerServiceWorker, $, ready } from 'https://cdn.kernvalley.us/js/std-js/functions.js';

customElements.define(HTMLOpenStreetMapElement.tagName, HTMLOpenStreetMapElement);

if (document.documentElement.dataset.hasOwnProperty('serviceWorker')) {
	registerServiceWorker(document.documentElement.dataset.serviceWorker).catch(console.error);
}

document.documentElement.classList.replace('no-js', 'js');
document.body.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
document.body.classList.toggle('no-details', document.createElement('details') instanceof HTMLUnknownElement);

ready().then(async () => {
	const map = document.querySelector('open-street-map');
	await map.ready;

	$('#search').input(({target}) => {
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

	document.getElementById('search-items').append(...map.markers.map(({title}) => {
		const item = document.createElement('option');
		item.textContent = title;
		return item;
	}));

});
