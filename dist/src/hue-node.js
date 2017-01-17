/** Copyright (c) 2013 Bryan Johnson; Licensed MIT */
"use strict";
const hue_colors_1 = require("./hue-colors");
const axios = require("axios");
const shortFlashType = 'select';
const longFlashType = 'lselect';
const offState = { on: false };
const onState = { on: true };
const shortFlashState = { alert: this.shortFlashType };
const longFlashState = { alert: this.longFlashType };
const fullBrightness = 254;
class Hue {
    constructor(config) {
        this.bridgeIP = '';
        this.apiKey = '';
        this.baseApiUrl = '';
        this.numberOfLamps = 3; // defaulted to the # of lamps included in the starter kit, update if you've connected additional bulbs
        this.currentBrightness = [254, 254, 254]; // default to full brightness
        this.colors = new hue_colors_1.HueColors();
        this.lampStates = [];
        this.setConfig(config);
    }
    /**
     * Reconstruct the baseUrl and baseApiUrl members when configuration is updated.
     *
     * @param {boolean} retrieveState Pass true to retrieve the initial brightness state of all bulbs from the Hue bridge
     */
    updateURLs(retrieveState) {
        this.baseApiUrl = `http://${this.bridgeIP}/api/${this.apiKey}`;
        if (!!retrieveState) {
            for (let i = 0; i < this.numberOfLamps; i++) {
                this.getBrightness(i + 1).then(response => {
                    this.currentBrightness[i] = response.data.state.bri;
                });
            }
        }
    }
    /**
     * Convenience function to perform an asynchronous HTTP PUT with the
     * provided JSON data.
     *
     * @param {String} url The URL to send the PUT request to
     * @param {Function} callback The function to invoke on a successful response
     * @param {Object} data The JSON data
     * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
     */
    putJSON(url, data) {
        return this._http.put(url, data);
    }
    ;
    /**
     * Convenience function used to query the state of a Hue lamp or other
     * bridge-administered resource.
     *
     * @param {String} destination URL to send HTTP GET request to
     * @param {Function} success Callback function to invoke on successful response
     * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
     */
    get(destination, success) {
        return this._http.get(destination);
    }
    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * index.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp
     * @return {String} URL to put state to a lamp
     */
    buildStateURL(lampIndex) {
        return `lights/${lampIndex}/state`;
    }
    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * group.
     *
     * @param {number} groupIndex 0-based index of the lamp group (where 0 refers to the reserved group of all connected lamps)
     * @return {String} URL to trigger a group action
     */
    buildGroupActionURL(groupIndex) {
        return `groups/${groupIndex}/action`;
    }
    /**
     * Convenience function used to initiate an HTTP PUT request to modify
     * state.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to modify.
     * @param {String} data String containing the JSON state object to commit to the lamp.
     * @param {Function} success Callback function to invoke on successful response.
     * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
     */
    put(lampIndex, data, success) {
        return this.putJSON(this.buildStateURL(lampIndex), data);
    }
    /**
     * Convenience function used to initiate an HTTP PUT request to modify state of a group of lamps.
     *
     * @param {number} Index of the lamp group to modify
     * @param {Object} Object containing desired lamp state
     * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
     */
    putGroupAction(groupIndex, action) {
        return this.putJSON(this.buildGroupActionURL(groupIndex), action);
    }
    /**
     * Convenience function used to initiate HTTP PUT requests to modify state
     * of all connected Hue lamps.
     *
     * @param {String} data String containing the JSON state object to commit to the lamps
     * @param {Function} success Callback function to invoke on successful response
     * @return {AxiosPromise[]} Array of promises representing the group of remote calls to the Hue bridge
     */
    putAll(data, success) {
        let promises = [];
        for (let i = 0; i < this.numberOfLamps; ++i) {
            promises.push(this.putJSON(this.buildStateURL(i + 1), data));
        }
        return promises;
    }
    /**
     * Convenience function used to build a URL to query a lamp's status.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp.
     * @return {String} URL to query a specific lamp.
     */
    buildLampQueryURL(lampIndex) {
        return `lights/${lampIndex}`;
    }
    /**
     * Builds a JSON state object for the CIE 1931 color coordinates provided.
     * If the transitionTime property has been set, it is also included in the
     * JSON object.
     *
     * @param {number[]} CIE 1931 X,Y color coordinates.
     * @return {Object} State object containing CIE X,Y coordinates.
     */
    buildXYState(xyCoords) {
        let stateObj = { xy: xyCoords };
        if (typeof (this.transitionTime) === 'number') {
            stateObj.transitiontime = this.transitionTime;
        }
        return stateObj;
    }
    /**
     * Returns the brightness of the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the lamp to query.
     * @return {AxiosPromise} Brightness of the lamp at lampIndex. 0 - 255.
     */
    getBrightness(lampIndex) {
        return this.get(this.buildLampQueryURL(lampIndex));
    }
    /**
     * Builds a JSON state object used to set the brightness of a Hue lamp to
     * the value of the brightness parameter.
     *
     * @param {number} brightness Integer value between 0 and 254. Note that 0
     * is not equivalent to the lamp's off state.
     * @return {Object} JSON object used to set brightness.
     */
    buildBrightnessState(brightness) {
        return { bri: brightness };
    }
    /**
     * Flash the lamp at lampIndex for a short time.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to flash.
     * @return {Object} JSON object containing lamp state.
     */
    flash(lampIndex) {
        return this.put(lampIndex, shortFlashState);
    }
    /**
     * Flash all connected lamps for a short time.
     *
     * @return {Object} JSON object containing lamp state.
     */
    flashAll() {
        return this.putAll(shortFlashState);
    }
    /**
     * Flash the lamp at lampIndex for a long time.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to flash.
     * @return {Object} JSON object containing lamp state.
     */
    longFlash(lampIndex) {
        return this.put(lampIndex, longFlashState);
    }
    /**
     * Flash all connected lamps for a long time.
     *
     * @return {Object} JSON object containing lamp state.
     */
    longFlashAll() {
        return this.putAll(longFlashState);
    }
    /**
     * Set the lamp at lampIndex to the approximate CIE x,y equivalent of
     * the provided hex color.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to colorize.
     * @param {String} color String representing a hexadecimal color value.
     * @return {AxiosPromise} Promise representing the remote call
     */
    setColor(lampIndex, color) {
        let state = this.buildXYState(this.colors.getCIEColor(color));
        return this.put(lampIndex, state);
    }
    /**
     * Sets all connected lamps to the approximate CIE x,y equivalent of
     * the provided hex color.
     *
     * @param {String} color String representing a hexadecimal color value.
     * @return {AxiosPromise} Promise representing the remote call
     */
    setAllColors(color) {
        let state = this.buildXYState(this.colors.getCIEColor(color));
        return this.putGroupAction(0, state);
    }
    /**
     * Turn off the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn off.
     * @return {AxiosPromise0} Promise representing the remote call
     */
    turnOff(lampIndex) {
        return this.put(lampIndex, offState);
    }
    /**
     * Turn on the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn on.
     * @return {Promise} Promise representing the remote call
     */
    turnOn(lampIndex) {
        return this.put(lampIndex, onState);
    }
    /**
     * Turn off all connected lamps.
     *
     * @return {AxiosPromise} Promise representing the remote call
     */
    turnOffAll() {
        return this.putGroupAction(0, offState);
    }
    /**
     * Turn on all connected lamps.
     *
     * @return {AxiosPromise} Promise representing the remote call
     */
    turnOnAll() {
        return this.putGroupAction(0, onState);
    }
    /**
     * Set the brightness of the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to modify.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {AxiosPromise} Promise representing the remote call
     */
    setBrightness(lampIndex, brightness) {
        return this.put(lampIndex, this.buildBrightnessState(brightness));
    }
    /**
     * Set the brightness of all connected lamps.
     *
     * @param {number} brightness Integer value between 0 and 254.
     * @return {AxiosPromise} Promise representing the remote call
     */
    setAllBrightness(brightness) {
        return this.putGroupAction(0, this.buildBrightnessState(brightness));
    }
    /**
     * Set the brightness of an indexed group of lamps.
     *
     * @param {number} groupIndex 0-based lamp group index.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {AxiosPromise} Promise representing the remote call
     */
    setGroupBrightness(groupIndex, brightness) {
        return this.putGroupAction(groupIndex, this.buildBrightnessState(brightness));
    }
    /**
     * Dim the lamp at lampIndex by decrement.
     *
     * @param {number} lampIndex 1-based lamp index.
     * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
     * @return {Object} JSON object containing lamp state.
     */
    dim(lampIndex, decrement) {
        decrement = decrement || 10; // default to 10 if decrement not provided.
        let currentBrightness = this.currentBrightness[lampIndex];
        let adjustedBrightness = currentBrightness - decrement;
        let newBrightness = (adjustedBrightness > 0) ? adjustedBrightness : 0;
        return this.setBrightness(lampIndex, newBrightness);
    }
    /**
     * Dim all lamps by decrement.
     *
     * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
     * @return {Object[]} JSON objects containing lamp states.
     */
    dimAll(decrement) {
        let states = [];
        for (let i = 0; i < this.numberOfLamps; ++i) {
            states.push(this.dim(i + 1, decrement));
        }
        return states;
    }
    /**
     * Brighten the lamp at lampIndex by increment.
     *
     * @param {number} lampIndex 1-based lamp index.
     * @param {number} [increment] Amount to increment brightness by (between 0 and 255).
     * @return {Object} JSON object containing lamp state.
     */
    brighten(lampIndex, increment) {
        increment = increment || 10;
        let currentBrightness = this.currentBrightness[lampIndex];
        let adjustedBrightness = currentBrightness + increment;
        let newBrightness = (adjustedBrightness < 255) ? adjustedBrightness : 254;
        return this.setBrightness(lampIndex, newBrightness);
    }
    /**
     * Brighten all lamps by increment.
     *
     * @param {number} [increment] Amount to increment brightness by (between 0 and 255).
     * @return {Object[]} JSON objects containing lamp states.
     */
    brightenAll(increment) {
        let states = [];
        for (let i = 0; i < this.numberOfLamps; ++i) {
            states.push(this.brighten(i + 1, increment));
        }
        return states;
    }
    /**
     * Return the value of the configured transitionTime property.
     *
     * @return {number} Value of the transitionTime property. Null by default if not
     * set.
     */
    getTransitionTime() {
        return this.transitionTime;
    }
    /**
     * Set the value of the transitionTime property.
     *
     * @param {number} time Lamp color transition time in approximate milliseconds.
     */
    setTransitionTime(time) {
        this.transitionTime = time;
    }
    /**
     * Set the number of lamps available to control.
     *
     * @param {number} The total number of lamps available to interact with. Default is 3.
     */
    setnumberOfLamps(numLamps) {
        this.numberOfLamps = numLamps;
    }
    /**
     * Get the locally saved brightness value for the lamp at lampIndex.
     *
     * @param {number} lampIndex The index of the lamp to return the current brightness of
     */
    getCurrentBrightness(lampIndex) {
        return this.currentBrightness[lampIndex];
    }
    /**
     * Get a reference to the bundled color utility module.
     */
    getColors() {
        return this.colors;
    }
    /**
     * Get a handle on the axios instance used to perform HTTP calls.
     */
    getHttp() {
        return this._http;
    }
    /**
     * Set the IP address of the bridge and the API key to use to control
     * the Hue lamps.
     *
     * @param {Object} Containing key and ip properties.
     */
    setConfig(config) {
        let retrieveState = false;
        if (config) {
            this.apiKey = config.key || "";
            this.bridgeIP = config.ip || "";
            retrieveState = config.retrieveInitialState || false;
            this.numberOfLamps = config.numberOfLamps || 3;
        }
        this.updateURLs(retrieveState);
        this._http = axios.default.create({
            baseURL: this.baseApiUrl
        });
    }
}
exports.Hue = Hue;
