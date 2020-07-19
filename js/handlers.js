import { createCustomElement } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { site } from './consts.js';

export async function stateHandler({ state }) {
	const { uuid = null, longitude = NaN, latitude = NaN, title = null, body = null } = state || {};

	if (typeof uuid === 'string') {
		const marker = document.getElementById(uuid);

		if (marker instanceof HTMLElement && marker.tagName === 'LEAFLET-MARKER') {
			const map = marker.closest('leaflet-map');
			await map.ready;
			document.title = `${title} | ${site.title}`;
			map.center = marker;
			marker.open = true;
		}
	} else if (! (Number.isNaN(longitude) || Number.isNaN(latitude))) {
		const marker = await createCustomElement('leaflet-marker');
		const map = document.querySelector('leaflet-map');
		const icon = new Image(32, 32);
		await map.ready;

		icon.decoding = 'async';
		icon.loading = 'lazy';
		icon.alt = '';
		icon.referrerPolicy = 'no-referrer';
		icon.crossOrigin = 'anonymous';
		icon.src = new URL('./img/adwaita-icons/actions/mark-location.svg', site.iconBaseUri).href;
		icon.slot = 'icon';

		marker.longitude = longitude;
		marker.latitude = latitude;
		marker.slot = 'markers';
		marker.title = title;

		if (body instanceof HTMLElement) {
			body.slot = 'popup';
			body.append(document.createElement('hr'), await getShareButton({text: title}));
			if ('part' in body) {
				body.part.add('popup');
			}
			marker.append(icon, body);
			map.center = marker;
			marker.open = true;
		} else if (typeof body === 'string') {
			const popup = document.createElement('div');
			const h4 = document.createElement('h4');
			const content = document.createElement('div');

			h4.textContent = title;
			content.textContent = body;
			popup.slot = 'popup';
			popup.append(h4, content, document.createElement('hr'), await getShareButton({text: title}));

			if ('part' in popup) {
				popup.part.add('popup');
			}
			marker.append(icon, popup);
			map.center = marker;
			map.append(marker);
			marker.open = true;
		} else {
			marker.append(icon);
			map.center = marker;
			map.append(marker);
			marker.open = true;
		}
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
