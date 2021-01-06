import { createCustomElement, getLocation, sleep } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { SECONDS } from 'https://cdn.kernvalley.us/js/std-js/date-consts.js';
import { site } from './consts.js';

export async function locate() {
	const { coords: { longitude, latitude }} = await getLocation({
		enableHighAccuracy: true,
		maxAge: 5 * SECONDS,
	});

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
		await Promise.all([
			customElements.whenDefined('leaflet-map'),
			customElements.whenDefined('leaflet-marker'),
		]);
		const map = document.querySelector('leaflet-map');
		await map.ready;
		const Marker = customElements.get('leaflet-marker');
		const marker = new Marker({
			latitude,
			longitude,
			title,
			icon: new URL('./img/adwaita-icons/actions/mark-location.svg', site.iconBaseUri).href,
			popup: body || `Marked Location: ${latitude}, ${longitude}`,
		});
		marker.title = title;
		marker.addEventListener('close', ({ target }) => sleep(750).then(() => target.remove()));
		map.append(marker);

		map.center = marker;
		map.zoom = 17;
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
