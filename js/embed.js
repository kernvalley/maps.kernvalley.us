'use strict';

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

async function getCustomElement(tag) {
	await customElements.whenDefined(tag);
	return customElements.get(tag);
}

Promise.all([
	getCustomElement('leaflet-map'),
	getCustomElement('leaflet-marker'),
	ready(),
]).then(async ([LeafletMap, LeafletMarker]) => {
	const params = new URLSearchParams(location.search);
	const map = new LeafletMap({
		crossOrigin: 'anonymous',
		detectRetina: true,
		latitude: parseFloat(params.get('latitude')) || 35.678054901407855,
		longitude: parseFloat(params.get('longitude')) || -118.42575073242189,
		maxZoom: parseInt(params.get('maxZoom')) || 19,
		minZoom: parseInt(params.get('minZoom')) || 1,
		zoom: parseInt(params.get('zoom')),
		watch: parseInt(params.get('watch')),
		zoomControl: params.has('zoomControl'),
		find: parseInt(params.get('find')),
	});

	document.body.append(map);

	if (params.has('tiles') && LeafletMap.tileServers.hasOwnProperty(params.get('tiles'))) {
		map.setTileServer(LeafletMap.tileServers[params.get('tiles')]);
	}

	if (params.has('markers')) {
		await Promise.all([
			map.ready,
			map.loadMarkers(...params.get('markers').split('|')).catch(console.error),
		]);
	}

	if (params.has('popup') && params.has('latitude') && params.has('longitude')) {
		const marker = new LeafletMarker({
			latitude: parseFloat(params.get('markerLatitude')) || parseFloat(params.get('latitude')),
			longitude: parseFloat(params.get('markerLongitude')) || parseFloat(params.get('longitude')),
			popup: params.get('popup'),
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
});
