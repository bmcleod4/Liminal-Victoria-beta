'use strict';

const Evented = require('../../util/evented');
const browser = require('../../util/browser');
const DOM = require('../../util/dom');
const window = require('../../util/window');

const geoOptions = { enableHighAccuracy: false, timeout: 6000 /* 6sec */ };
const className = 'mapboxgl-ctrl';

/**
 * A `GeolocateControl` control provides a button that uses the browser's geolocation
 * API to locate the user on the map.
 *
 * @example
 * map.addControl(new mapboxgl.GeolocateControl());
 */
class GeolocateControl extends Evented {

    onAdd(map) {
        this._map = map;
        this._container = DOM.create('div', `${className}-group`);

        if (browser.supportsGeolocation) {
            this._container.addEventListener('contextmenu',
                e => e.preventDefault());
            this._geolocateButton = DOM.create('button',
                `${className}-icon ${className}-geolocate`,
                this._container);
            this._geolocateButton.type = 'button';
            this._geolocateButton.setAttribute('aria-label', 'Geolocate');
            this._geolocateButton.addEventListener('click',
                this._onClickGeolocate.bind(this));
        }

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

    _onClickGeolocate() {

        const finish = () => {
            if (this._timeoutId) { clearTimeout(this._timeoutId); }
            this._timeoutId = undefined;
        };

        const onSuccess = (position) => {
            this._map.jumpTo({
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 17,
                bearing: 0,
                pitch: 0
            });

            this.fire('geolocate', position);
            finish();
        };

        const onError = (error) => {
            this.fire('error', error);
            finish();
        };

        window.navigator.geolocation.getCurrentPosition(
            onSuccess, onError, geoOptions);

        // This timeout ensures that we still call finish() even if
        // the user declines to share their location in Firefox
        this._timeoutId = setTimeout(finish, 10000 /* 10sec */);
    }
}

module.exports = GeolocateControl;

/**
 * geolocate event.
 *
 * @event geolocate
 * @memberof GeolocateControl
 * @instance
 * @property {Position} data The returned [Position](https://developer.mozilla.org/en-US/docs/Web/API/Position) object from the callback in [Geolocation.getCurrentPosition()](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
 *
 */

/**
 * error event.
 *
 * @event error
 * @memberof GeolocateControl
 * @instance
 * @property {PositionError} data The returned [PositionError](https://developer.mozilla.org/en-US/docs/Web/API/PositionError) object from the callback in [Geolocation.getCurrentPosition()](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
 *
 */
