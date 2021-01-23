'use strict';

async function ready() {
	if (document.readyState === 'loading') {
		await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
	}
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

	if (params.has('markers')) {
		await Promise.all([
			map.ready,
			map.loadMarkers(...params.get('markers').split('|')).catch(console.error),
		]);
	}

	if (params.has('markerLatitude') && params.has('markerLongitude') && params.has('popup')) {
		const icon = new URL('https://cdn.kernvalley.us/img/markers.svg');
		icon.hash = `#${params.get('icon') || 'map-marker'}`;
		const marker = new LeafletMarker({
			latitude: parseFloat(params.get('markerLatitude')),
			longitude: parseFloat(params.get('markerLongitude')),
			popup: params.get('popup'),
			icon: icon.href,
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
