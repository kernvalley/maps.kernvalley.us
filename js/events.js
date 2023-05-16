import { getCustomElement } from '@shgysk8zer0/kazoo/custom-elements.js';
import { setURLParams } from '@shgysk8zer0/kazoo/http.js';
import { ready, data } from '@shgysk8zer0/kazoo/dom.js';
import { createElement } from '@shgysk8zer0/kazoo/elements.js';
import { loadImage } from '@shgysk8zer0/kazoo/loader.js';
import { useSVG } from '@shgysk8zer0/kazoo/svg.js';
import { days, months } from '@shgysk8zer0/kazoo/date-consts.js';
import { getEvents } from '@shgysk8zer0/kazoo/krv/events.js';

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
		address.append(createElement('h3', { text: name, itemprop: 'name' }));
	}

	if (typeof streetAddress === 'string') {
		address.append(createElement('div', {
			children: [
				createElement('div', {
					children: [
						createElement('div', {
							children: [
								useSVG('mark-location', { height: 16, width: 16, fill: 'currentColor' }),
								createElement('span', { text: ' ' }),
								createElement('span', { text: streetAddress, itemprop: 'streetAddress' }),
							]
						}),
						createElement('span', { text: ' ' }),
						createElement('span', { text: addressLocality, itemprop: 'addressLocality' }),
						createElement('span', { text: ', '}),
						createElement('span', { text: addressRegion, itemprop: 'addressRegion' }),
					]
				}),
				createElement('meta', { itemprop: 'addressCountry', content: addressCountry }),
				createElement('meta', { itemprop: 'postalCode', content: postalCode }),
			]
		}));
	} else {
		address.append(
			createElement('div', {
				children: [
					useSVG('mark-location', { height: 16, width: 16, fill: 'currentColor' }),
					createElement('span', { text: ' ' }),
					createElement('span', { text: addressLocality, itemprop: 'addressLocality' }),
					createElement('span', { text: ', '}),
					createElement('span', { text: addressRegion, itemprop: 'addressRegion' }),
				]
			}),
			createElement('meta', { itemprop: 'addressCountry', content: addressCountry }),
			createElement('meta', { itemprop: 'postalCode', content: postalCode }),
		);
	}


	return address;
}

function createOrganizer({ name, telephone, email, url, '@type': type = 'LocalBusiness' }) {
	const container = createElement('div', {
		itemprop: 'organizer',
		itemtype: `https://schema.org/${type}`,
		itemscope: true,
		children: [createElement('h4', { text: 'Organized by' })]
	});

	if (typeof url === 'string') {
		container.append(createElement('a', {
			href: setURLParams(url, UTM).href,
			rel: 'noopener noreferrer external',
			itemprop: 'url',
			children: [
				createElement('span', { itemprop: 'name', text: name }),
				createElement('span', { text: ' ' }),
				useSVG('link-external', { height: 16, width: 16, fill: 'currentColor' }),
			]
		}));
	} else {
		container.append(createElement('span', { itemprop: 'name', text: name }));
	}

	if (typeof email === 'string') {
		container.append(
			document.createElement('br'),
			createElement('a', {
				href: `mailto:${email}`,
				itemprop: 'email',
				content: email,
				children:[
					useSVG('mail', { height: 18, width: 18, fill: 'currentColor' }),
					createElement('span', { text: ' '}),
					createElement('span', { text: email }),
				]
			}),
		);
	}

	if (typeof telephone === 'string') {
		container.append(createElement('meta', { itemprop: 'telephone', content: telephone }));
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
			createElement('div', {
				slot: 'popup',
				children: [
					createElement('h2', {
						children: [
							createElement('a', {
								href: setURLParams(url, UTM).href,
								rel: 'noopener noreferrer external',
								itemprop: 'url',
								children: [
									createElement('span', { text: name, itemprop: 'name' }),
									createElement('span', { text: ' ' }),
									useSVG('link-external', { height: 16, width: 16, fill: 'currentColor' }),
								],
							})
						]
					}),
					createElement('div', {
						children: [
							createElement('div', {
								children: [
									createElement('b', {
										children: [
											useSVG('calendar', { height: 16, width: 16, fill: 'currentColor' }),
											createElement('span', { text: ' Start: '}),

										]
									}),
									createElement('time', {
										text: formatDate(startDate),
										itemprop: 'startDate',
										datetime: startDate,
									}),
								]
							}),
							createElement('div', {
								children: [
									createElement('b', {
										children: [
											useSVG('calendar', { height: 16, width: 16, fill: 'currentColor' }),
											createElement('span', { text: ' End: ' }),
										]
									}),
									createElement('time', {
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
					createElement('blockquote', { text: description, itemprop: 'description' }),
					createElement('div', {
						itemprop: 'location',
						children: [
							createAddress(address),
							createElement('div', {
								itemprop: 'geo',
								itemtype: 'https://schema.org/GeoCoordinates',
								children: [
									createElement('meta', { itemprop: 'latitude', content: latitude }),
									createElement('meta', { itemprop: 'longitude', content: longitude }),
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
