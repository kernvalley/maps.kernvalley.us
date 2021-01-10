export function getMarkers() {
	return Array.from(document.querySelectorAll('leaflet-marker'));
}

export function getMarkerTitles() {
	return getMarkers().map(marker => marker.title);
}

export function registerMapSearch(form = document.forms.search) {
	if (form instanceof HTMLFormElement) {
		form.hidden = false;
		form.addEventListener('submit', async event => {
			event.preventDefault();
			const data = new FormData(event.target);
			const query = data.get('query').toLowerCase();

			if (query !== '') {
				const markers = getMarkers();
				markers.forEach(marker => marker.hidden = ! marker.title.toLowerCase().includes(query));

				const shown = markers.filter(marker => marker.hidden === false);
				if (shown.length === 1) {
					shown[0].open = true;
				}
			}
		});
	}
}

export async function geoGranted() {
	if ('permissions' in navigator && navigator.permissions.query instanceof Function) {
		const { state } = await navigator.permissions.query({ name: 'geolocation' });
		return state === 'granted';
	} else {
		return false;
	}
}
