'use strict';

if ('trustedTypes' in globalThis) {
	const sanitizer = new Sanitizer();
	trustedTypes.createPolicy('default', {
		createHTML: input => sanitizer.sanitizeFor('div', input).innerHTML,
	});
}

async function ready() {
	if (document.readyState === 'loading') {
		await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
	}
}

function getIcon(icon = 'map-marker', { size = 28 } = {}) {
	const url = new URL('https://cdn.kernvalley.us/img/markers.svg');
	const img = new Image(size, size);
	img.crossOrigin = 'anonymous';
	img.referrerPolicy = 'no-referrer';
	img.loading = 'lazy';
	img.decoding = 'async';
	url.hash = `#${icon}`;
	img.src = url.href;
	img.slot = 'icon';
	return img;
}

function markerHandler({ type }) {
	const { id, title, latitude, longitude } = this;
	switch(type) {
		case 'open':
			window.postMessage({ opened: { id, title, latitude, longitude }});
			break;

		case 'close':
			window.postMessage({ closed: { id, title, latitude, longitude }});
			break;
	}
}

async function getCustomElement(tag) {
	return customElements.whenDefined(tag);
}

window.addEventListener('message', async ({ data }) => {
	await Promise.all([ready(), customElements.whenDefined('leaflet-map')]);

	if (Array.isArray(data.loadMarkers)) {
		await document.body.firstElementChild.loadMarkers(...data.loadMarkers);
		window.dispatchEvent(new Event('markers'));
	}

	if (typeof data.marker === 'object' && (typeof data.marker.latitude === 'number' && typeof data.marker.longitude === 'number')) {
		const LeafletMarker = await getCustomElement('leaflet-marker');
		document.querySelector('leaflet-map').append(new LeafletMarker(data.marker));
	}

	if (typeof data.open === 'string') {
		const marker = document.getElementById(data.open);

		if (marker instanceof HTMLElement && marker.tagName === 'LEAFLET-MARKER') {
			marker.open = true;
		}
	}

	if (typeof data.longitude === 'number' && data.latitude === 'number') {
		const { latitude, longitude } = data;
		document.querySelector('leaflet-map').center = { latitude, longitude };
	}

	if (Number.isSafeInteger(data.zoom)) {
		document.querySelector('leaflet-map').zoom = data.zoom;
	}

	if (Number.isSafeInteger(data.locate)) {
		document.querySelector('leaflet-map').locate({ maxZoom: data.locate });
	}

	if (Number.isSafeInteger(data.watch)) {
		document.querySelector('leaflet-map').locate({ maxZoom: data.watch, watch: true });
	}
});

Promise.all([
	getCustomElement('leaflet-map'),
	getCustomElement('leaflet-marker'),
	ready(),
]).then(async ([LeafletMap, LeafletMarker]) => {
	const params = new URLSearchParams(location.search);
	const map = new LeafletMap({
		crossOrigin: 'anonymous',
		detectRetina: true,
		allowFullscreen: params.has('fullscreen'),
		allowLocate: params.has('locate'),
		latitude: parseFloat(params.get('latitude')) || 35.678054901407855,
		longitude: parseFloat(params.get('longitude')) || -118.42575073242189,
		maxZoom: parseInt(params.get('maxZoom')) || 19,
		minZoom: parseInt(params.get('minZoom')) || 1,
		zoom: parseInt(params.get('zoom')),
		watch: parseInt(params.get('watch')),
		zoomControl: params.has('zoomControl'),
		find: parseInt(params.get('find')),
	});

	map.id = 'leaflet-map';

	map.addEventListener('markerschange', ({ detail }) => {
		detail.forEach(marker => {
			marker.addEventListener('open', markerHandler);
			marker.addEventListener('close', markerHandler);
		});
	});

	document.body.append(map);

	if (params.has('tiles') && LeafletMap.tileServers.hasOwnProperty(params.get('tiles'))) {
		map.setTileServer(LeafletMap.tileServers[params.get('tiles')]);
	}

	if (params.has('markers')) {
		const types = params.get('markers').split('|');
		if (types.includes('all')) {
			await map.ready;
			const resp = await fetch('/places/all.json');
			const json = await resp.json();
			const markers = await Promise.all(Object.values(json).flat()
				.filter(marker => 'geo' in marker || ('location' in marker && 'geo' in marker.location))
				.map(async marker => {
					const markerEl = new LeafletMarker({
						latitude: 'geo' in markers ? marker.geo.latitude : marker.location.geo.latitude,
						longitude: 'geo' in markers ? marker.geo.longitude : marker.location.geo.longitude,
						popup: `<h3>${marker.name}</h3>`,
						icon: await LeafletMarker.getSchemaIcon(marker),
					});

					if (typeof marker.identifier === 'string') {
						markerEl.id = marker.identifier;
						markerEl.title = marker.name;
					}

					return markerEl;
				}));
			map.append(...markers);
		} else {
			await Promise.all([
				map.ready,
				map.loadMarkers(...types).catch(console.error),
			]);
		}
	}

	if (location.hash.length > 1) {
		const marker = document.getElementById(location.hash.substr(1));

		if (marker instanceof HTMLElement) {
			marker.open = true;
			map.flyTo(marker, 16);
		}
	} else if (params.has('popup') && params.has('latitude') && params.has('longitude')) {
		const marker = new LeafletMarker({
			latitude: parseFloat(params.get('markerLatitude')) || parseFloat(params.get('latitude')),
			longitude: parseFloat(params.get('markerLongitude')) || parseFloat(params.get('longitude')),
			popup: trustedTypes.defaultPolicy.createHTML(params.get('popup')),
			icon: getIcon(params.get('icon') || 'map-marker', {
				size: parseInt(params.get('iconSize')) || 28,
			}),
		});

		marker.open = true;
		map.append(marker);
		setTimeout(() => map.flyTo(marker, 16), 50);
	} else if (params.has('open')) {
		const marker = document.getElementById(params.get('open'));

		if (marker instanceof HTMLElement) {
			marker.open = true;
			map.flyTo(marker, 16);
		}
	}

	await map.ready;
});
