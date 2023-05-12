import { getCustomElement } from 'std-js/custom-elements.js';
import { setURLParams } from 'std-js/http.js';
import { create, ready, data } from 'std-js/dom.js';
import { loadImage } from 'std-js/loader.js';
import { useSVG } from 'std-js/svg.js';
import { days, months } from 'std-js/date-consts.js';
import { getEvents } from 'std-js/krv/events.js';

const ICON = 'https://cdn.kernvalley.us/img/markers.svg#event';
const IMAGE = 'https://cdn.kernvalley.us/img/raster/missing-image.png';
const UTM = {
	utm_campaign: 'krv-events',
	utm_source: 'krv-maps',
	utm_medium: 'referral',
	utm_content: 'marker',
};

function formatDate(date) {
	const day = days[date.getDay()].short;
	const month = months[date.getMonth()].short;

	return `${day}, ${month}. ${date.getDate()}, ${date.toLocaleTimeString().replace(':00 ', ' ')}`;
}

function createAddress({
	name,
	streetAddress,
	addressLocality,
	addressRegion = 'CA',
	addressCountry = 'US',
	postalCode,
	'@type': type = 'PostalAddress',
}) {
	const address = document.createElement('address');
	address.setAttribute('itemtype', `https://schema.org/${type}`);
	address.setAttribute('itemscope', '');
	address.setAttribute('itemprop', 'address');

	if (typeof name === 'string') {
		address.append(create('h3', { text: name, itemprop: 'name' }));
	}

	if (typeof streetAddress === 'string') {
		address.append(create('div', {
			children: [
				create('div', {
					children: [
						create('div', {
							children: [
								useSVG('mark-location', { height: 16, width: 16, fill: 'currentColor' }),
								create('span', { text: ' ' }),
								create('span', { text: streetAddress, itemprop: 'streetAddress' }),
							]
						}),
						create('span', { text: ' ' }),
						create('span', { text: addressLocality, itemprop: 'addressLocality' }),
						create('span', { text: ', '}),
						create('span', { text: addressRegion, itemprop: 'addressRegion' }),
					]
				}),
				create('meta', { itemprop: 'addressCountry', content: addressCountry }),
				create('meta', { itemprop: 'postalCode', content: postalCode }),
			]
		}));
	} else {
		address.append(
			create('div', {
				children: [
					useSVG('mark-location', { height: 16, width: 16, fill: 'currentColor' }),
					create('span', { text: ' ' }),
					create('span', { text: addressLocality, itemprop: 'addressLocality' }),
					create('span', { text: ', '}),
					create('span', { text: addressRegion, itemprop: 'addressRegion' }),
				]
			}),
			create('meta', { itemprop: 'addressCountry', content: addressCountry }),
			create('meta', { itemprop: 'postalCode', content: postalCode }),
		);
	}


	return address;
}

function createOrganizer({ name, telephone, email, url, '@type': type = 'LocalBusiness' }) {
	const container = create('div', {
		itemprop: 'organizer',
		itemtype: `https://schema.org/${type}`,
		itemscope: true,
		children: [create('h4', { text: 'Organized by' })]
	});

	if (typeof url === 'string') {
		container.append(create('a', {
			href: setURLParams(url, UTM).href,
			rel: 'noopener noreferrer external',
			itemprop: 'url',
			children: [
				create('span', { itemprop: 'name', text: name }),
				create('span', { text: ' ' }),
				useSVG('link-external', { height: 16, width: 16, fill: 'currentColor' }),
			]
		}));
	} else {
		container.append(create('span', { itemprop: 'name', text: name }));
	}

	if (typeof email === 'string') {
		container.append(
			document.createElement('br'),
			create('a', {
				href: `mailto:${email}`,
				itemprop: 'email',
				content: email,
				children:[
					useSVG('mail', { height: 18, width: 18, fill: 'currentColor' }),
					create('span', { text: ' '}),
					create('span', { text: email }),
				]
			}),
		);
	}

	if (typeof telephone === 'string') {
		container.append(create('meta', { itemprop: 'telephone', content: telephone }));
	}

	return container;
}

export async function addEventsToMap(map) {
	const now = Date.now();
	const [events, LeafletMarker] = await Promise.all([
		getEvents(),
		getCustomElement('leaflet-marker'),
		customElements.whenDefined('leaflet-map'),
		ready(),
	]);

	map.append(...await Promise.all(events.map(async ({
		name, url, description, image, organizer, startDate, endDate, identifier,
		location: { name: locationName, address, geo: { latitude, longitude } },
		'@type': type = 'Event',
	}) => {
		const marker = new LeafletMarker();
		if (typeof locationName === 'string' && (typeof address.name !== 'string' || address.name.length === 0 )) {
			address.name = locationName;
		}

		if (typeof identifier === 'string' && identifier.length !== 0) {
			marker.id = identifier;
		}

		marker.setAttribute('itemtype', `https://schema.org/${type}`);
		marker.setAttribute('itemscope', '');
		startDate = new Date(startDate);
		endDate = new Date(endDate);
		marker.geo = { latitude, longitude };
		marker.title = name;
		data([marker], { startDate, endDate });
		marker.append(
			create('div', {
				slot: 'popup',
				children: [
					create('h2', {
						children: [
							create('a', {
								href: setURLParams(url, UTM).href,
								rel: 'noopener noreferrer external',
								itemprop: 'url',
								children: [
									create('span', { text: name, itemprop: 'name' }),
									create('span', { text: ' ' }),
									useSVG('link-external', { height: 16, width: 16, fill: 'currentColor' }),
								],
							})
						]
					}),
					create('div', {
						children: [
							create('div', {
								children: [
									create('b', {
										children: [
											useSVG('calendar', { height: 16, width: 16, fill: 'currentColor' }),
											create('span', { text: ' Start: '}),

										]
									}),
									create('time', {
										text: formatDate(startDate),
										itemprop: 'startDate',
										datetime: startDate,
									}),
								]
							}),
							create('div', {
								children: [
									create('b', {
										children: [
											useSVG('calendar', { height: 16, width: 16, fill: 'currentColor' }),
											create('span', { text: ' End: ' }),
										]
									}),
									create('time', {
										text: formatDate(endDate),
										itemprop: 'endDate',
										datetime: endDate,
									}),
								]
							}),

						]
					}),
					document.createElement('br'),
					await loadImage(image || IMAGE, { itemprop: 'image', loading: 'lazy' }),
					create('blockquote', { text: description, itemprop: 'description' }),
					create('div', {
						itemprop: 'location',
						children: [
							createAddress(address),
							create('div', {
								itemprop: 'geo',
								itemtype: 'https://schema.org/GeoCoordinates',
								children: [
									create('meta', { itemprop: 'latitude', content: latitude }),
									create('meta', { itemprop: 'longitude', content: longitude }),
								]
							})
						]}
					),
					document.createElement('br'),
					createOrganizer(organizer),
				]
			}),

			await loadImage(ICON, { height: 28, width: 28, slot: 'icon' })
		);

		marker.hidden = now > startDate;
		return marker;
	})));
}
