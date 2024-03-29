import { ready } from '@shgysk8zer0/kazoo/dom.js';
import { getCustomElement } from '@shgysk8zer0/kazoo/custom-elements.js';

export async function consumeHandler({ files }) {
	if (files.length === 1) {
		try {
			const fileHandle = files[0];
			const [GeoJSON, file] = await Promise.all([
				getCustomElement('leaflet-geojson'),
				fileHandle.getFile(),
				ready(),
			]);

			const map = document.querySelector('leaflet-map');
			const geoJSON = new GeoJSON();
			geoJSON.data = file;
			geoJSON.stroke = 'red';
			geoJSON.weight = 4;
			map.append(geoJSON);
		} catch(err) {
			console.error(err);
			alert(err.message);
		}
	}
}
