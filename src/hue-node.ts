/** Copyright (c) 2013 Bryan Johnson; Licensed MIT */

import { HueColors } from './hue-colors';
import needle = require('needle');
import { Axios, AxiosInstance, AxiosPromise } from 'axios';

interface PoweredState {
    on: boolean;
}

interface AlertState {
    alert: string;
}

interface HueConfig {
    key: string;
    ip: string;
}

const shortFlashType = 'select';
const longFlashType = 'lselect';
const offState: PoweredState = { on: false };
const onState: PoweredState = { on: true };
const shortFlashState: AlertState = { alert: this.shortFlashType };
const longFlashState: AlertState = { alert: this.longFlashType };

export class Hue {

    constructor() {
        this.colors = new HueColors();

        this._http = Axios.create({
            timeout: 250,
            transformResponse: function(data: any) {
                return JSON.parse(data);
            }
        });
    }

    private bridgeIP: string = ''; // use your Hue bridge's IP address here
    private apiKey: string = ''; // use the API key you've registered with your hue bridge here
    private baseUrl: string = `http://${this.bridgeIP}/api`;
    private baseApiUrl: string = `${this.baseUrl}/${this.apiKey}`;
    private numberOfLamps: number = 3; // defaulted to the # of lamps included in the starter kit, update if you've connected additional bulbs
    private transitionTime: number;
    private _http: AxiosInstance;
    
    public colors: HueColors;

    public getColors(): HueColors {
        return this.colors;
    }

    /**
     * Reconstruct the baseUrl and baseApiUrl members when configuration is updated.
     */
    private updateURLs(): void {
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
    private putJSON(url: string, data: any): AxiosPromise {
        return this._http.put(url, {
            data: data
        });
    };

    /**
     * Convenience function used to query the state of a Hue lamp or other
     * bridge-administered resource.
     *
     * @param {String} destination URL to send HTTP GET request to.
     * @param {Function} success Callback function to invoke on successful response.
     * @return {Object} JSON bulb configuration data.
     */
    private get(destination: string, success?: Function): AxiosPromise {
        return this._http.get(destination);
    }

    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * index.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp.
     * @return {String} URL to put state to a lamp.
     */
    private buildStateURL(lampIndex: number): string {
        return `${this.baseApiUrl}/lights/${lampIndex}/state`;
    }

    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * group.
     *
     * @param {number} groupIndex 0-based index of the lamp group.
     * @return {String} URL to trigger a group action.
     */
    private buildGroupActionURL(groupIndex: number): string {
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
    private put(lampIndex: number, data: any, success?: Function): AxiosPromise {
        return this.putJSON(this.buildStateURL(lampIndex), data);
    }

    /**
     * Convenience function used to initiate an HTTP PUT request to modify state of a group of lamps.
     *
     * @param {number} Index of the lamp group to modify
     * @param {Object} Object containing desired lamp state
     * @return {Object} JSON bulb group state data.
     */
    private putGroupAction(groupIndex: number, action: any): Promise {
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
    private putAll(data: any, success?: Function): AxiosPromise[] {
        let promises: AxiosPromise[] = [];
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
    private buildLampQueryURL(lampIndex: number): string {
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
    private buildXYState(xyCoords: number[]): any {
        let stateObj: any = { xy: xyCoords };

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
    private getBrightness(lampIndex: number): number {
        let lampState = this.get(this.buildLampQueryURL(lampIndex));
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
    private buildBrightnessState(brightness: number): any {
        return { bri: brightness };
    }

    /** 
     * Flash the lamp at lampIndex for a short time. 
     *	
     * @param {number} lampIndex 1-based index of the Hue lamp to flash.
     * @return {Object} JSON object containing lamp state.
     */
    public flash(lampIndex: number): any {
        return this.put(lampIndex, shortFlashState);
    }

    /** 
     * Flash all connected lamps for a short time.
     *
     * @return {Object} JSON object containing lamp state.
     */
    public flashAll(): any {
        return this.putAll(shortFlashState);
    }

    /** 
     * Flash the lamp at lampIndex for a long time.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to flash.
     * @return {Object} JSON object containing lamp state.
     */
    public longFlash(lampIndex: number): any {
        return this.put(lampIndex, longFlashState);
    }

    /** 
     * Flash all connected lamps for a long time.
     *
     * @return {Object} JSON object containing lamp state.
     */
    public longFlashAll() {
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
    public setColor(lampIndex: number, color: string): any {
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
    public setAllColors(color: string) {
        let state = this.buildXYState(this.colors.getCIEColor(color));
        return this.putGroupAction(0, state);
    }

    /**
     * Turn off the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn off.
     * @return {Object} JSON object containing lamp state.
     */
    public turnOff(lampIndex: number): any {
        return this.put(lampIndex, offState);
    }

    /** 
     * Turn on the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn on.
     * @return {Object} JSON object containing lamp state.
     */
    public turnOn(lampIndex: number): any {
        return this.put(lampIndex, onState);
    }

    /** 
     * Turn off all connected lamps.
     *
     * @return {Object} JSON object containing lamp state.
     */
    public turnOffAll(): any {
        return this.putGroupAction(0, offState);
    }
    
    /** 
     * Turn on all connected lamps.
     *
     * @return {Object} JSON object containing lamp state.
     */
    public turnOnAll() {
        return this.putGroupAction(0, onState);
    }

    /**
     * Set the brightness of the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to modify.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {Object} JSON object containing lamp state.
     */
    public setBrightness(lampIndex: number, brightness: number): any {
        let state = this.buildBrightnessState(brightness);
        return this.put(lampIndex, state);
    }

    /**
     * Set the brightness of all connected lamps.
     *
     * @param {number} brightness Integer value between 0 and 254.
     * @return {Object} JSON object containing all lamp state.
     */
    public setAllBrightness(brightness: number) {
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
    public setGroupBrightness(groupIndex: number, brightness: number): any {
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
    public dim(lampIndex: number, decrement?: number): any {
        decrement = decrement || 10; // default to 10 if decrement not provided.
        let currentBrightness: number = this.getBrightness(lampIndex);
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
    public dimAll(decrement?: number): any {
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
    public brighten(lampIndex: number, increment?: number): any {
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
    public brightenAll(increment: number): any {
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
    public getTransitionTime(): number {
        return this.transitionTime;
    }

    /**
     * Set the value of the transitionTime property.
     *
     * @param {number} time Lamp color transition time in approximate milliseconds.
     */
    public setTransitionTime(time: number): void {
        this.transitionTime = time;
    }

    /**
     * Set the IP address of the bridge and the API key to use to control
     * the Hue lamps.
     * 
     * @param {Object} Containing key and ip properties.
     */
    public setConfig(config: any): void {
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
    public setnumberOfLamps(numLamps: number): void {
        this.numberOfLamps = numLamps;
    }
}
