<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Sharing of places via `<button is="share-button">`

### Fixed
- Re-add find location button

## [v2.0.1] - 2021-01-05

### Added
- `openingHoursSpecification` support
- Add WIP template for creating responsive images from an array of `ImageObject`s
- Several new icons
- Add CORS headers for map icons (`/img/markers/*.svg`)
- Toggling of marker visibility based on map zoom level

### Changed
- Replace `_data/places/` directory with `kernvalley/places` submodule
- Update preloading
- Use `<template>` for Leaflet popups for simpler DOM
- Use `address.html` template for marker addresses
- Update icons to be primarily based on `@type` unless explicitly given icon to use
- Reduced icon / marker size
- Use CDN for map marker icons

### Fixed
- Invalid phone links
- Centering and zooming into markers based on URL hash

## [v2.0.0] - 2020-12-29

### Changed
- Rewrite to use Jekyll instead of static HTML
- Store place info in `_data/places/*.yml`

## [v1.1.8] - 2020-12-13

### Added
- Fullscreen button
- Use `<button is="app-list">` component
- Add `cookieStore` handling for theme

### Changed

- Update to Leaflet [1.7.1](https://leafletjs.com/2020/09/04/leaflet-1.7.1.html)
- Allow `apps.kernvalley.us` in CSP
- Update style of nav links & buttons
- Use weather component via `_includes/`
- Move `<button is="pwa-install">` to `<nav>`

### Fixed
- Fix CSP blocking Analytics [#58](https://github.com/kernvalley/maps.kernvalley.us/issues/58)

## [v1.1.7] - 2020-09-06

### Added
- Implement preloading
- Import icons from WFD app

### Changed
- Update various dependencies

### Fixed
- Add missing popup content for Kernville Saloon

### Removed
- Do not set preload headers

## [v1.1.6] - 2020-08-21

### Added
- `htmlhint`
- Google Analytics ID

### Changed
- Update GitHub's Super Linter config

### Fixed
- `htmlhint` linting errors

## [v1.1.5] - 2020-08-08

### Added
- `geo:` URI handler registration
- Handling of `geo:` URIs -> `#${latitude},${longitude}`

### Changed
- Loading polyfill.io dynamically
- Update eslint

## [v1.1.4] - 2020-07-21

### Changed
- But map search inside `<div slot="toolbar">`
- Do not show an `<leaflet-marker>`s unless `<leaflet-map>` is defined
- Add warning if `<leaflet-map>` is not defined

## [v1.1.3] - 2020-07-20

### Added
- Add markers using Whiskey Flat Days info

### Changed
- Starlite -> Eddy Out
- Update icons for map

## [v1.1.2] - 2020-07-18

### Changed
- Update icons to be "maskable"
- Update [`.editorconfig`]() to set indent style and width
- Use `history.state` for map navigation
- Update misc config

## [v1.1.1] - 2020-07-15

### Updated
- Components now use external stylesheets
- Enable project-wide linting
- Block `unsafe-inline` styles in CSP

## [v1.1.0] - 2020-07-03

### Added
- CHANGELOG
- Dependabot config
- Super Linter
- Minifying of JS & CSS
- Add `<github-user>` to footer
- `.well-known/assetlinks.json` for TWA support
- Play Store app id for install prompt

### Changed
- Update service worker cache & config to use minified resources

### Removed
- Travis-CI config file (just use GitHub Actions)
<!-- markdownlint-restore -->
