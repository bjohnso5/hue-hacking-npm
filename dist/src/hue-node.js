/** Copyright (c) 2013 Bryan Johnson; Licensed MIT */
"use strict";
const hue_colors_1 = require("./hue-colors");
const axios_1 = require("axios");
const shortFlashType = 'select';
const longFlashType = 'lselect';
const offState = { on: false };
const onState = { on: true };
const shortFlashState = { alert: this.shortFlashType };
const longFlashState = { alert: this.longFlashType };
class Hue {
    constructor() {
        this.bridgeIP = ''; // use your Hue bridge's IP address here
        this.apiKey = ''; // use the API key you've registered with your hue bridge here
        this.baseUrl = `http://${this.bridgeIP}/api`;
        this.baseApiUrl = `${this.baseUrl}/${this.apiKey}`;
        this.numberOfLamps = 3; // defaulted to the # of lamps included in the starter kit, update if you've connected additional bulbs
        this.colors = new hue_colors_1.HueColors();
        this._http = axios_1.Axios.create({
            timeout: 250,
            transformResponse: function (data) {
                return JSON.parse(data);
            }
        });
    }
    getColors() {
        return this.colors;
    }
    /**
     * Reconstruct the baseUrl and baseApiUrl members when configuration is updated.
     */
    updateURLs() {
        this.baseUrl = `http://${this.bridgeIP}/api`;
        this.baseApiUrl = `${this.baseUrl}/${this.apiKey}`;
    }
    /**
     * Convenience function to perform an asynchronous HTTP PUT with the
     * provided JSON data.
     *
     * @param {String} url The URL to send the PUT request to.
     * @param {Function} callback The function to invoke on a successful response.
     * @param {Object} data The JSON data.
     * @return {Object} The JSON data.
     */
    putJSON(url, data) {
        return this._http.put(url, {
            data: data
        });
    }
    ;
    /**
     * Convenience function used to query the state of a Hue lamp or other
     * bridge-administered resource.
     *
     * @param {String} destination URL to send HTTP GET request to.
     * @param {Function} success Callback function to invoke on successful response.
     * @return {Object} JSON bulb configuration data.
     */
    get(destination, success) {
        return this._http.get(destination);
    }
    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * index.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp.
     * @return {String} URL to put state to a lamp.
     */
    buildStateURL(lampIndex) {
        return `${this.baseApiUrl}/lights/${lampIndex}/state`;
    }
    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * group.
     *
     * @param {number} groupIndex 0-based index of the lamp group.
     * @return {String} URL to trigger a group action.
     */
    buildGroupActionURL(groupIndex) {
        return `${this.baseApiUrl}/groups/${groupIndex}/action`;
    }
    /**
     * Convenience function used to initiate an HTTP PUT request to modify
     * state.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to modify.
     * @param {String} data String containing the JSON state object to commit to the lamp.
     * @param {Function} success Callback function to invoke on successful response.
     * @return {Object} JSON bulb state data.
     */
    put(lampIndex, data, success) {
        return this.putJSON(this.buildStateURL(lampIndex), data);
    }
    /**
     * Convenience function used to initiate an HTTP PUT request to modify state of a group of lamps.
     *
     * @param {number} Index of the lamp group to modify
     * @param {Object} Object containing desired lamp state
     * @return {Object} JSON bulb group state data.
     */
    putGroupAction(groupIndex, action) {
        return this.putJSON(this.buildGroupActionURL(groupIndex), action);
    }
    /**
     * Convenience function used to initiate HTTP PUT requests to modify state
     * of all connected Hue lamps.
     *
     * @param {String} data String containing the JSON state object to commit to the lamps.
     * @param {Function} success Callback function to invoke on successful response.
     * @return {Object} JSON object containing state to apply to lamp.
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
        return `${this.baseApiUrl}/lights/${lampIndex}`;
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
     * @return {number} Brightness of the lamp at lampIndex. 0 - 255.
     */
    getBrightness(lampIndex) {
        let lampState = await;
        this.get(this.buildLampQueryURL(lampIndex));
        return lampState.state.bri;
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
     * @return {Object} JSON object containing lamp state.
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
     * @return {Object} JSON object containing lamp state.
     */
    setAllColors(color) {
        let state = this.buildXYState(this.colors.getCIEColor(color));
        return this.putGroupAction(0, state);
    }
    /**
     * Turn off the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn off.
     * @return {Object} JSON object containing lamp state.
     */
    turnOff(lampIndex) {
        return this.put(lampIndex, offState);
    }
    /**
     * Turn on the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn on.
     * @return {Object} JSON object containing lamp state.
     */
    turnOn(lampIndex) {
        return this.put(lampIndex, onState);
    }
    /**
     * Turn off all connected lamps.
     *
     * @return {Object} JSON object containing lamp state.
     */
    turnOffAll() {
        return this.putGroupAction(0, offState);
    }
    /**
     * Turn on all connected lamps.
     *
     * @return {Object} JSON object containing lamp state.
     */
    turnOnAll() {
        return this.putGroupAction(0, onState);
    }
    /**
     * Set the brightness of the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to modify.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {Object} JSON object containing lamp state.
     */
    setBrightness(lampIndex, brightness) {
        let state = this.buildBrightnessState(brightness);
        return this.put(lampIndex, state);
    }
    /**
     * Set the brightness of all connected lamps.
     *
     * @param {number} brightness Integer value between 0 and 254.
     * @return {Object} JSON object containing all lamp state.
     */
    setAllBrightness(brightness) {
        let state = this.buildBrightnessState(brightness);
        return this.putGroupAction(0, state);
    }
    /**
     * Set the brightness of an indexed group of lamps.
     *
     * @param {number} groupIndex 0-based lamp group index.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {Object} JSON object containing group state.
     */
    setGroupBrightness(groupIndex, brightness) {
        let state = this.buildBrightnessState(brightness);
        return this.putGroupAction(groupIndex, state);
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
        let currentBrightness = this.getBrightness(lampIndex);
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
            states[i] = this.dim(i + 1, decrement);
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
        let currentBrightness = this.getBrightness(lampIndex);
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
            states[i] = this.brighten(i + 1, increment);
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
     * Set the IP address of the bridge and the API key to use to control
     * the Hue lamps.
     *
     * @param {Object} Containing key and ip properties.
     */
    setConfig(config) {
        if (config.key) {
            this.apiKey = config.key;
        }
        if (config.ip) {
            this.bridgeIP = config.ip;
        }
        this.updateURLs();
    }
    /**
     * Set the number of lamps available to control.
     *
     * @param {number} The total number of lamps available to interact with. Default is 3.
     */
    setnumberOfLamps(numLamps) {
        this.numberOfLamps = numLamps;
    }
}
exports.Hue = Hue;
