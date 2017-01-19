/** Copyright (c) 2013 Bryan Johnson; Licensed MIT */

import { HueColors } from './hue-colors';
import { XYPoint } from './hue-interfaces';
import axios = require('axios');
import { AxiosInstance, AxiosPromise, AxiosResponse, AxiosRequestConfig } from 'axios';
import { HueConfig, LampState, AlertState, PoweredState } from './hue-interfaces';

const shortFlashType = 'select';
const longFlashType = 'lselect';
const offState: PoweredState = { on: false };
const onState: PoweredState = { on: true };
const shortFlashState: AlertState = { alert: this.shortFlashType };
const longFlashState: AlertState = { alert: this.longFlashType };
const fullBrightness: number = 254;
const _colors = new HueColors();

export class Hue {

    private lampStates: LampState[] = [];
    private baseApiUrl: string = '';
    private transitionTime: number;
    private _http: AxiosInstance;
    private currentBrightness: number[] = [254, 254, 254]; // default to full brightness
    private config: HueConfig = null;

    constructor(config?: HueConfig) {
        this.setConfig(config);
    }

    /**
     * Set the IP address of the bridge and the API key to use to control
     * the Hue lamps.
     * 
     * @param {Object} Containing key and ip properties.
     */
    private setConfig(config: HueConfig): void {
        this.config = config || {ip: '', key: '', retrieveInitialState: false, numberOfLamps: 3};
        this.config.retrieveInitialState = this.config.retrieveInitialState || false;
        this.config.numberOfLamps = this.config.numberOfLamps || 3;

        this.baseApiUrl = `http://${this.config.ip}/api/${this.config.key}`;

        this._http = axios.default.create({
            baseURL: this.baseApiUrl
        });
    }

    /**
     * Reconstruct the baseUrl and baseApiUrl members when configuration is updated.
     * 
     * @param {boolean} retrieveState Pass true to retrieve the initial brightness state of all bulbs from the Hue bridge
     */
    private async retrieveInitialState(): Promise<any> {
        let promises: Promise<any>[] = [];
        for(let i = 0; i < this.config.numberOfLamps; i++) {
            let promise = this.getBrightness(i + 1);
            promises.push(promise);
            
            promise.then(response => {
                this.currentBrightness[i] = response.data.state.bri;
            }); 
        }

        let returnGroup = Promise.all(promises);
        returnGroup.then(reason => {
            console.log(reason);
        });

        return returnGroup;
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
    private putJSON(url: string, data: any): AxiosPromise {
        return this._http.put(url, data);
    }

    /**
     * Convenience function used to query the state of a Hue lamp or other
     * bridge-administered resource.
     *
     * @param {String} destination URL to send HTTP GET request to
     * @param {Function} success Callback function to invoke on successful response
     * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
     */
    private get(destination: string, success?: Function): AxiosPromise {
        return this._http.get(destination);
    }

    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * index.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp
     * @return {String} URL to put state to a lamp
     */
    private buildStateURL(lampIndex: number): string {
        return `lights/${lampIndex}/state`;
    }

    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * group.
     *
     * @param {number} groupIndex 0-based index of the lamp group (where 0 refers to the reserved group of all connected lamps)
     * @return {String} URL to trigger a group action
     */
    private buildGroupActionURL(groupIndex: number): string {
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
    private put(lampIndex: number, data: any, success?: Function): AxiosPromise {
        return this.putJSON(this.buildStateURL(lampIndex), data);
    }

    /**
     * Convenience function used to initiate an HTTP PUT request to modify state of a group of lamps.
     *
     * @param {number} Index of the lamp group to modify
     * @param {Object} Object containing desired lamp state
     * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
     */
    private putGroupAction(groupIndex: number, action: any): AxiosPromise {
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
    private putAll(data: any, success?: Function): AxiosPromise[] {
        let promises: AxiosPromise[] = [];
        for (let i = 0; i < this.config.numberOfLamps; ++i) {
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
    private buildXYState(xyCoords: XYPoint): any {
        let stateObj: any = { xy: [xyCoords.x, xyCoords.y] };

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
    private async getBrightness(lampIndex: number): Promise<AxiosResponse> {
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
    private buildBrightnessState(brightness: number): any {
        return { bri: brightness };
    }

    public colors: HueColors = _colors;

    public async init(): Promise<void> {
        return this.config.retrieveInitialState ? 
                this.retrieveInitialState() : 
                Promise.resolve();
    }

    /** 
     * Flash the lamp at lampIndex for a short time. 
     *	
     * @param {number} lampIndex 1-based index of the Hue lamp to flash.
     * @return {Object} JSON object containing lamp state.
     */
    public flash(lampIndex: number): AxiosPromise {
        return this.put(lampIndex, shortFlashState);
    }

    /** 
     * Flash all connected lamps for a short time.
     *
     * @return {Object} JSON object containing lamp state.
     */
    public flashAll(): AxiosPromise[] {
        return this.putAll(shortFlashState);
    }

    /** 
     * Flash the lamp at lampIndex for a long time.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to flash.
     * @return {Object} JSON object containing lamp state.
     */
    public longFlash(lampIndex: number): AxiosPromise {
        return this.put(lampIndex, longFlashState);
    }

    /** 
     * Flash all connected lamps for a long time.
     *
     * @return {Object} JSON object containing lamp state.
     */
    public longFlashAll(): AxiosPromise[] {
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
    public setColor(lampIndex: number, color: string): AxiosPromise {
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
    public setAllColors(color: string): AxiosPromise {
        let state = this.buildXYState(this.colors.getCIEColor(color));
        return this.putGroupAction(0, state);
    }

    /**
     * Turn off the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn off.
     * @return {AxiosPromise0} Promise representing the remote call
     */
    public turnOff(lampIndex: number): AxiosPromise {
        return this.put(lampIndex, offState);
    }

    /** 
     * Turn on the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn on.
     * @return {Promise} Promise representing the remote call
     */
    public turnOn(lampIndex: number): AxiosPromise {
        return this.put(lampIndex, onState);
    }

    /** 
     * Turn off all connected lamps.
     *
     * @return {AxiosPromise} Promise representing the remote call
     */
    public turnOffAll(): AxiosPromise {
        return this.putGroupAction(0, offState);
    }
    
    /** 
     * Turn on all connected lamps.
     *
     * @return {AxiosPromise} Promise representing the remote call
     */
    public turnOnAll(): AxiosPromise {
        return this.putGroupAction(0, onState);
    }

    /**
     * Set the brightness of the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to modify.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {AxiosPromise} Promise representing the remote call
     */
    public setBrightness(lampIndex: number, brightness: number): AxiosPromise {
        return this.put(lampIndex, this.buildBrightnessState(brightness));
    }

    /**
     * Set the brightness of all connected lamps.
     *
     * @param {number} brightness Integer value between 0 and 254.
     * @return {AxiosPromise} Promise representing the remote call
     */
    public setAllBrightness(brightness: number): AxiosPromise {
        return this.putGroupAction(0, this.buildBrightnessState(brightness));
    }

    /**
     * Set the brightness of an indexed group of lamps.
     *
     * @param {number} groupIndex 0-based lamp group index.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {AxiosPromise} Promise representing the remote call
     */
    public setGroupBrightness(groupIndex: number, brightness: number): AxiosPromise {
        return this.putGroupAction(groupIndex, this.buildBrightnessState(brightness));
    }

    /**
     * Dim the lamp at lampIndex by decrement.
     * 
     * @param {number} lampIndex 1-based lamp index.
     * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
     * @return {Object} JSON object containing lamp state.
     */
    public dim(lampIndex: number, decrement?: number): AxiosPromise {
        decrement = decrement || 10; // default to 10 if decrement not provided.
        let currentBrightness: number = this.currentBrightness[lampIndex];
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
    public dimAll(decrement?: number): AxiosPromise[] {
        let states: AxiosPromise[] = [];
        for (let i = 0; i < this.config.numberOfLamps; ++i) {
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
    public brighten(lampIndex: number, increment?: number): AxiosPromise {
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
    public brightenAll(increment: number): AxiosPromise[] {
        let states: AxiosPromise[] = [];
        for (let i = 0; i < this.config.numberOfLamps; ++i) {
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
     * Set the number of lamps available to control.
     *
     * @param {number} The total number of lamps available to interact with. Default is 3.
     */
    public setnumberOfLamps(numLamps: number): void {
        this.config.numberOfLamps = numLamps;
    }

    /**
     * Get the locally saved brightness value for the lamp at lampIndex.
     * 
     * @param {number} lampIndex The index of the lamp to return the current brightness of
     */
    public getCurrentBrightness(lampIndex: number): number {
        return this.currentBrightness[lampIndex];
    }

    /**
     * Get a reference to the bundled color utility module.
     */
    public getColors(): HueColors {
        return this.colors;
    }

    /**
     * Get a handle on the axios instance used to perform HTTP calls.
     */
    public getHttp(): AxiosInstance {
        return this._http;
    }
}
