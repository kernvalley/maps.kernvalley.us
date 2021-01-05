import { createCustomElement, getLocation, sleep } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { site } from './consts.js';

export async function locate() {
	const { coords: { longitude, latitude }} = await getLocation({ enableHighAccuracy: true });
	const url = new URL(location.href);
	url.hash = `#${latitude},${longitude}`;
	history.pushState({
		latitude,
		longitude,
		title: 'Current Location',
		body: `Location: ${latitude}, ${longitude}`,
	}, `Location | ${site.title}`, url);
	stateHandler(history.state);
}

export async function stateHandler({ state }) {
	const { uuid = null, longitude = NaN, latitude = NaN, title = null, body = null } = state || history.state;

	if (typeof uuid === 'string') {
		const marker = document.getElementById(uuid);

		if (marker instanceof HTMLElement && marker.tagName === 'LEAFLET-MARKER') {
			const map = marker.closest('leaflet-map');
			document.title = `${title} | ${site.title}`;
			await Promise.allSettled([map.ready, marker.ready, sleep(200)]);
			map.center = marker;
			map.zoom = Math.max(marker.maxZoom || 18, 18);
			marker.hidden = false;
			marker.open = true;
		}
	} else if (! (Number.isNaN(longitude) || Number.isNaN(latitude))) {
		document.title = `${title || 'Marked Location'} | ${site.title}`;
		const map = document.querySelector('leaflet-map');
		await map.ready;
		const marker = await map.addMarker({
			latitude,
			longitude,
			title,
			icon: new URL('./img/adwaita-icons/actions/mark-location.svg', site.iconBaseUri).href,
			open: false,
			center: false,
			popup: body || `Marked Location: ${latitude}, ${longitude}`,
		});

		// if (body instanceof HTMLElement) {
		// 	body.slot = 'popup';
		// 	body.append(document.createElement('hr'), await getShareButton({text: title}));

		// 	if ('part' in body) {
		// 		body.part.add('popup');
		// 	}
		// 	marker.append(body);
		// } else if (typeof body === 'string') {
		// 	const popup = document.createElement('div');
		// 	const h4 = document.createElement('h4');
		// 	const content = document.createElement('div');

		// 	h4.textContent = title;
		// 	content.textContent = body;
		// 	popup.slot = 'popup';
		// 	popup.append(h4, content, document.createElement('hr'), await getShareButton({text: title}));

		// 	if ('part' in popup) {
		// 		popup.part.add('popup');
		// 	}

		// 	marker.append(popup);
		// }

		map.center = marker;
		marker.open = true;
	} else if (state === null) {
		document.title = `Home | ${site.title}`;
	}
}

export async function getShareButton({text, url = location.href, textContent = 'Share'} = {}) {
	const btn = await createCustomElement('share-button');
	btn.text = text;
	btn.url = url;
	btn.textContent = textContent;
	btn.hidden = ! (navigator.share instanceof Function);
	return btn;
}
