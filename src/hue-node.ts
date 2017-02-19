/** Copyright (c) 2013 Bryan Johnson; Licensed MIT */

import axios = require('axios');
import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { HueColors } from './hue-colors';
import { HueConfig, XYPoint, States, Lamp, HueBridgeStateChangeResponse, HueBridgeGroupActionResponse } from './hue-interfaces';

const offState: States.PoweredState = { "on": false };
const onState: States.PoweredState = { "on": true };
const shortFlashState: States.AlertState = { "alert": "select" };
const longFlashState: States.AlertState = { "alert": "lselect" };
const colorLoopEffect: States.EffectState = { "effect": "colorloop" };
const noEffect: States.EffectState = { "effect": "none" };
const maxBrightness: number = 254;
const minBrightness: number = 1;
const _colors = new HueColors();
const nupnpEndpoint: string = `https://www.meethue.com/api/nupnp`;
const _http = axios.default.create({
    timeout: 5000
});

export class Hue {

    private lampStates: States.LampState = [];
    private baseApiUrl: string = '';
    private _http: AxiosInstance = null;

    constructor(private config?: HueConfig) {
        this.setConfig(config);
    }

    /**
     * Set the IP address of the bridge and the API key to use to control
     * the Hue lamps.
     * 
     * @param {HueConfig} Configuration object.
     */
    private setConfig(config?: HueConfig): void {
        this.config = config || {ip: 'localhost', key: 'testapp', retrieveInitialState: false, numberOfLamps: 3};
        this.config.retrieveInitialState = this.config.retrieveInitialState || false;
        this.config.numberOfLamps = this.config.numberOfLamps || 3;
        this.config.transitionTime = this.config.transitionTime || 400;
        this.config.timeout = this.config.timeout || 2000;

        this._http = axios.default.create({
            timeout: this.config.timeout
        });

        this.baseApiUrl = `http://${this.config.ip}/api/${this.config.key}`;
    }

    /**
     * Retrieve the existing state of all connected lamps.
     * 
     * @return {Promise<any>} Promise representing the remote call(s)
     */
    private async retrieveInitialState(): Promise<any> {
        let promises: Promise<any>[] = [];
        if(this.config.retrieveInitialState) {
            for(let i = 0; i < this.config.numberOfLamps; i++) {
                let promise = this.getLampState(i + 1);
                promises.push(promise);
                
                promise.then(response => {
                    this.lampStates[i] = response.data.state;
                }); 
            }
        } else {
            // immediately resolve a void Promise
            promises.push(Promise.resolve());
        }

        return Promise.all(promises);
    }

    /**
     * Convenience function to perform an asynchronous HTTP PUT with the
     * provided JSON data.
     *
     * @param {string} url The URL to send the PUT request to
     * @param {Object} data The JSON data
     * @return {Promise<AxiosResponse>} Promise representing the remote call to the Hue bridge
     */
    private async putJSON(url: string, data: any): Promise<AxiosResponse> {
        return this._http.put(url, data);
    }

    /**
     * Convenience function used to query the state of a Hue lamp or other
     * bridge-administered resource.
     *
     * @param {String} destination URL to send HTTP GET request to
     * @return {Promise<AxiosResponse>} Promise representing the remote call to the Hue bridge
     */
    private async get(destination: string): Promise<AxiosResponse> {
        return this._http.get(destination);
    }

    /**
     * Get the full attribute state of an indexed Hue lamp.
     * 
     * @param {number} lampIndex 1-based index of the Hue lamp
     * @return {Promise<AxiosResponse>} Promise representing the remote call to the Hue bridge
     */
    private async getLampState(lampIndex: number): Promise<AxiosResponse> {
        return this.get(this.buildLampQueryURL(lampIndex));
    }

    /**
     * Convenience function used to build a URL to query all connected lamps.
     * 
     * @return {string} URL to query all connected lamps and their full attribute set
     */
    private buildLampCompositeURL(): string {
        return `${this.baseApiUrl}/lights`;
    }

    /**
     * Convenience function used to build a URL to query a lamp's status.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp.
     * @return {String} URL to query a specific lamp.
     */
    private buildLampQueryURL(lampIndex: number): string {
        return `${this.buildLampCompositeURL()}/${lampIndex}`;
    }

    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * index.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp
     * @return {String} URL to put state to a lamp
     */
    private buildStateURL(lampIndex: number): string {
        return `${this.buildLampQueryURL(lampIndex)}/state`;
    }

    /**
     * Convenience function used to build a state URL for a provided Hue lamp
     * group.
     *
     * @param {number} groupIndex 0-based index of the lamp group (where 0 refers to the reserved group of all connected lamps)
     * @return {String} URL to trigger a group action
     */
    private buildGroupActionURL(groupIndex?: number): string {
        const group = groupIndex || 0;
        return `${this.baseApiUrl}/groups/${group}/action`;
    }

    /**
     * Convenience function used to initiate an HTTP PUT request to modify 
     * state.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to modify.
     * @param {String} data String containing the JSON state object to commit to the lamp.
     * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
     */
    private async put(lampIndex: number, data: any): Promise<AxiosResponse> {
        return this.putJSON(this.buildStateURL(lampIndex), data);
    }

    /**
     * Convenience function used to initiate an HTTP PUT request to modify state of a group of lamps.
     *
     * @param {number} Index of the lamp group to modify
     * @param {Object} Object containing desired lamp state
     * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
     */
    private async putGroupAction(groupIndex: number, action: any): Promise<AxiosResponse> {
        return this.putJSON(this.buildGroupActionURL(groupIndex), action);
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
        let stateObj: States.ColorState = { xy: [xyCoords.x, xyCoords.y] };
        return stateObj;
    }

    /**
     * Returns the brightness of the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the lamp to query.
     * @return {Promise<number>} Promise to retrieve the brightness of the lamp at lampIndex. 0 - 254.
     */
    public async getBrightness(lampIndex: number): Promise<number> {
        return this.get(this.buildLampQueryURL(lampIndex)).then(response => {
            let state: States.LampState = response.data && response.data.state ? response.data.state : {};
            return state.bri || undefined;
        });
    }

    /**
     * Builds a JSON state object used to set the brightness of a Hue lamp to
     * the value of the brightness parameter.
     *
     * @param {number} brightness Integer value between 0 and 254. Note that 0
     * is not equivalent to the lamp's off state.
     * @return {Object} JSON object used to set brightness.
     */
    private buildBrightnessState(brightness: number): States.BrightnessState {
        return { bri: brightness };
    }

    /**
     * Builds a JSON state object used to set a brightness decrement of a Hue lamp (a negative bri_inc is effectively a decrement).
     */
    private buildDimState(decrement?: number): States.BrightnessIncrementState {
        return { bri_inc: -(Math.abs(decrement || 10)) };
    }

    /**
     * Builds a JSON state object used to set a brightness increment of a Hue lamp.
     */
    private buildBrightenState(increment?: number): States.BrightnessIncrementState {
        let incrementState = this.buildDimState(increment);
        incrementState.bri_inc = Math.abs(incrementState.bri_inc);
        return incrementState;
    }

    /**
     * Query Philips' nupnp endpoint for details of any Hue bridges attached to the LAN.
     * 
     * @return {Promise<string>} Promise representing the remote call
     */
    public static async search(): Promise<string> {
        return _http.get(nupnpEndpoint).then(response => {
            return response.data[0].internalipaddress;
        });
    }

    /**
     * Color manipulation utility
     */
    public colors: HueColors = _colors;

    /**
     * Perform initialization of this Hue instance
     */
    public async init(): Promise<void> {
        return this.retrieveInitialState();
    }

    /** 
     * Flash the lamp at lampIndex for a short time. 
     *	
     * @param {number} lampIndex 1-based index of the Hue lamp to flash.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async flash(lampIndex: number): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, shortFlashState).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /** 
     * Flash all connected lamps for a short time.
     *
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async flashAll(): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(0, shortFlashState).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }

    /** 
     * Flash the lamp at lampIndex for a long time.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to flash.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async longFlash(lampIndex: number): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, longFlashState).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /** 
     * Flash all connected lamps for a long time.
     *
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async longFlashAll(): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(0, longFlashState).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }

    /** 
     * Set the lamp at lampIndex to the approximate CIE x,y equivalent of 
     * the provided hex color.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to colorize.
     * @param {String} color String representing a hexadecimal color value.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async setColor(lampIndex: number, color: string): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, this.buildXYState(this.colors.getCIEColor(color))).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /**
     * Set the color temperature of the lamp at lampIndex.
     * 
     * @param {number} lampIndex 1-based index of the Hue lamp to colorize.
     * @param {number} colorTemperature Color temperature (in Kelvin) to set the lamp to (The approximate range is 2000 - 6000).
     * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call.
     */
    public async setColorTemperature(lampIndex: number, colorTemperature: number): Promise<HueBridgeStateChangeResponse> {
        let temperature = (colorTemperature < 2000) ? 2000 : colorTemperature;
        temperature = (temperature > 6000) ? 6000 : colorTemperature;
        let convertedTemp = Math.floor(this.colors.kelvinToMired(temperature));
        return this.put(lampIndex, {"ct": convertedTemp}).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /**
     * Sets all connected lamps to the approximate CIE x,y equivalent of 
     * the provided hex color.
     *
     * @param {String} color String representing a hexadecimal color value.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async setAllColors(color: string): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(0, this.buildXYState(this.colors.getCIEColor(color))).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }

    /**
     * Turn off the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn off.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async turnOff(lampIndex: number): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, offState).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /** 
     * Turn on the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to turn on.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async turnOn(lampIndex: number): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, onState).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /** 
     * Turn off all connected lamps.
     *
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async turnOffAll(): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(0, offState).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }
    
    /** 
     * Turn on all connected lamps.
     *
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async turnOnAll(): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(0, onState).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }

    /**
     * Set the brightness of the lamp at lampIndex.
     *
     * @param {number} lampIndex 1-based index of the Hue lamp to modify.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async setBrightness(lampIndex: number, brightness: number): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, this.buildBrightnessState(brightness)).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /**
     * Set the brightness of all connected lamps.
     *
     * @param {number} brightness Integer value between 0 and 254.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async setAllBrightness(brightness: number): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(0, this.buildBrightnessState(brightness)).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }

    /**
     * Set the brightness of an indexed group of lamps.
     *
     * @param {number} groupIndex 0-based lamp group index.
     * @param {number} brightness Integer value between 0 and 254.
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async setGroupBrightness(groupIndex: number, brightness: number): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(groupIndex, this.buildBrightnessState(brightness)).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }

    /**
     * Dim the lamp at lampIndex by decrement.
     * 
     * @param {number} lampIndex 1-based lamp index.
     * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async dim(lampIndex: number, decrement?: number): Promise<HueBridgeStateChangeResponse> {
        decrement = decrement || -10; // default to 10 if decrement not provided.
        return this.put(lampIndex, this.buildDimState(decrement)).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /**
     * Dim all lamps by decrement.
     * 
     * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async dimAll(decrement?: number): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(0, this.buildDimState(decrement)).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }

    /**
     * Brighten the lamp at lampIndex by increment.
     *
     * @param {number} lampIndex 1-based lamp index.
     * @param {number} [increment] Amount to increment brightness by (between 0 and 255).
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async brighten(lampIndex: number, increment?: number): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, this.buildBrightenState(increment)).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /**
     * Brighten all lamps by increment.
     *
     * @param {number} increment Amount to increment brightness by (between 0 and 255).
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async brightenAll(increment?: number): Promise<HueBridgeGroupActionResponse> {
        return this.putGroupAction(0, this.buildBrightenState(increment)).then(response => {
            return new HueBridgeGroupActionResponse(response.data);
        });
    }

    /**
     * Enable the colorloop effect on the indexed Hue lamp.
     * 
     * @param {number} lampIndex The indexed lamp to enable the effect on
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async startColorLoop(lampIndex: number): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, colorLoopEffect).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /**
     * Stop the currently enabled effect (if any) on the indexed Hue lamp.
     * 
     * @param {number} lampIndex The indexed lamp to enable the effect on
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async stopEffect(lampIndex: number): Promise<HueBridgeStateChangeResponse> {
        return this.put(lampIndex, noEffect).then(response => {
            return new HueBridgeStateChangeResponse(response.data);
        });
    }

    /**
     * Get the attributes of all lamps currently connected to the Hue bridge.
     * 
     * @return {Promise<AxiosResponse>} Promise representing the remote call
     */
    public async getLampStates(): Promise<States.LampState[]> {
        return this.get(this.buildLampCompositeURL()).then(response => {
            let states: States.LampState[] = [];
            let data = response.data;
            for(let key in data) {
                let state = data[key].state;
                if(state.reachable) {
                    states.push(state);
                }
            }
            return states;
        });
    }

    /**
     * Get a collection
     */
    public async getLamps(): Promise<Lamp[]> {
        return this.get(this.buildLampCompositeURL()).then(response => {
            let lamps: Lamp[] = [];
            for(let key in response.data) {
                let lamp: Lamp = response.data[key];
                lamps.push(lamp);
            }
            return lamps;
        });
    }

    /** 
     * Return the value of the configured transitionTime property.
     *
     * @return {number} Value of the transitionTime property. Null by default if not
     * set.
     */
    public getTransitionTime(): number {
        return this.config.transitionTime;
    }

    /**
     * Set the value of the transitionTime property.
     *
     * @param {number} time Lamp color transition time in approximate milliseconds.
     */
    public setTransitionTime(time: number): void {
        this.config.transitionTime = time;
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

    /**
     * Get a handle on the separate axios instance used to perform HTTP calls for static functions.
     */
    public static getHttp(): AxiosInstance {
        return _http;
    }
}
