/* Copyright (c) 2013 Bryan Johnson; Licensed MIT */

import * as axios from 'axios';
import { AxiosInstance, AxiosResponse } from 'axios';
import { HueColors } from './hue-colors';
import {
  HueBridge,
  HueConfig,
  XYPoint,
  States,
  Lamp,
  HueUPNPResponse,
  HueBridgeStateChangeResponse,
  HueBridgeGroupActionResponse,
  clampToRange
} from './hue-interfaces';

const offState: States.PoweredState = { on: false };
const onState: States.PoweredState = { on: true };
const shortFlashState: States.AlertState = { alert: 'select' };
const longFlashState: States.AlertState = { alert: 'lselect' };
const colorLoopEffect: States.EffectState = { effect: 'colorloop' };
const noEffect: States.EffectState = { effect: 'none' };
const _colors = new HueColors();
const nupnpEndpoint: string = `https://www.meethue.com/api/nupnp`;
const _http = axios.default.create({
  timeout: 5000
});

export class Hue extends HueBridge {
  private lampStates: States.LampState[] = [];
  private baseApiUrl: string = '';
  private _http: AxiosInstance = null;

  constructor(private config?: HueConfig) {
    super();
    this.setConfig(config);
  }

  /**
   * Set the IP address of the bridge and the API key to use to control
   * the Hue lamps.
   *
   * @param {HueConfig} config Configuration object.
   */
  private setConfig(config?: HueConfig): void {
    this.config = config || {
      ip: 'localhost',
      key: 'testapp',
      retrieveInitialState: false,
      numberOfLamps: 3
    };
    this.config.retrieveInitialState =
      this.config.retrieveInitialState || false;
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
    if (this.config.retrieveInitialState) {
      for (let i = 0; i < this.config.numberOfLamps; i++) {
        let promise = this.getState(i + 1);
        promises.push(promise);

        promise.then(r => {
          this.lampStates[i] = r.data.state;
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
    return await this._http.put(url, data);
  }

  /**
   * Convenience function used to query the state of a Hue lamp or other
   * bridge-administered resource.
   *
   * @param {string} destination URL to send HTTP GET request to
   * @return {Promise<AxiosResponse>} Promise representing the remote call to the Hue bridge
   */
  private async get(destination: string): Promise<AxiosResponse> {
    return await this._http.get(destination);
  }

  /**
   * Get the full attribute state of an indexed Hue lamp.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp
   * @return {Promise<AxiosResponse>} Promise representing the remote call to the Hue bridge
   */
  private async getState(lampIndex: number): Promise<AxiosResponse<Lamp>> {
    const url = this.buildLampQueryURL(lampIndex);
    return await this.get(url);
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
   * @return {string} URL to query a specific lamp.
   */
  private buildLampQueryURL(lampIndex: number): string {
    return `${this.buildLampCompositeURL()}/${lampIndex}`;
  }

  /**
   * Convenience function used to build a state URL for a provided Hue lamp
   * index.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp
   * @return {string} URL to put state to a lamp
   */
  private buildStateURL(lampIndex: number): string {
    return `${this.buildLampQueryURL(lampIndex)}/state`;
  }

  /**
   * Convenience function used to build a state URL for a provided Hue lamp
   * group.
   *
   * @param {number} groupIndex 0-based index of the lamp group (where 0 refers to the reserved group of all connected lamps)
   * @return {string} URL to trigger a group action
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
   * @param {string} data String containing the JSON state object to commit to the lamp.
   * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
   */
  private async put(lampIndex: number, data: any): Promise<AxiosResponse> {
    return await this.putJSON(this.buildStateURL(lampIndex), data);
  }

  /**
   * Convenience function used to initiate an HTTP PUT request to modify state of a group of lamps.
   *
   * @param {number} Index of the lamp group to modify
   * @param {Object} Object containing desired lamp state
   * @return {AxiosPromise} Promise representing the remote call to the Hue bridge
   */
  private async putGroupAction(
    groupIndex: number,
    action: any
  ): Promise<AxiosResponse> {
    return await this.putJSON(this.buildGroupActionURL(groupIndex), action);
  }

  /**
   * Builds a JSON state object for the CIE 1931 color coordinates provided.
   * If the transitionTime property has been set, it is also included in the
   * JSON object.
   *
   * @param {number[]} CIE 1931 X,Y color coordinates.
   * @return {States.ColorState} State object containing CIE X,Y coordinates.
   */
  private buildXYState(xyCoords: XYPoint): States.ColorState {
    return { xy: [xyCoords.x, xyCoords.y] };
  }

  /**
   * Returns the brightness of the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the lamp to query.
   * @return {Promise<number>} Promise to retrieve the brightness of the lamp at lampIndex. 0 - 254.
   */
  public async getBrightness(lampIndex: number): Promise<number> {
    const url = this.buildLampQueryURL(lampIndex);
    const { data } = await this.get(url);
    return data.state.bri;
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
    return { bri_inc: -Math.abs(decrement || 10) };
  }

  /**
   * Builds a JSON state object used to set a brightness increment of a Hue lamp.
   */
  private buildBrightenState(
    increment?: number
  ): States.BrightnessIncrementState {
    const incrementState = this.buildDimState(increment);
    incrementState.bri_inc = Math.abs(incrementState.bri_inc);
    return incrementState;
  }

  /**
   * Query Philips' nupnp endpoint for details of any Hue bridges attached to the LAN.
   *
   * @return {Promise<string>} Promise representing the remote call
   */
  public static async search(): Promise<HueUPNPResponse[]> {
    const nupnpResponse = await _http.get(nupnpEndpoint);
    const bridges: any[] = nupnpResponse.data;

    return bridges.map(b => new HueUPNPResponse(b));
  }

  /**
   * Color manipulation utility
   */
  public colors: HueColors = _colors;

  /**
   * Perform initialization of this Hue instance
   */
  public async init(): Promise<void> {
    return await this.retrieveInitialState();
  }

  /**
   * Flash the lamp at lampIndex for a short time.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to flash.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async flash(lampIndex: number): Promise<HueBridgeStateChangeResponse> {
    const { data } = await this.put(lampIndex, shortFlashState);
    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Flash all connected lamps for a short time.
   *
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async flashAll(): Promise<HueBridgeGroupActionResponse> {
    const { data } = await this.putGroupAction(0, shortFlashState);
    return new HueBridgeGroupActionResponse(data);
  }

  /**
   * Flash the lamp at lampIndex for a long time.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to flash.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async longFlash(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse> {
    const { data } = await this.put(lampIndex, longFlashState);
    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Flash all connected lamps for a long time.
   *
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async longFlashAll(): Promise<HueBridgeGroupActionResponse> {
    const { data } = await this.putGroupAction(0, longFlashState);
    return new HueBridgeGroupActionResponse(data);
  }

  /**
   * Set the lamp at lampIndex to the approximate CIE x,y equivalent of
   * the provided hex color.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to colorize.
   * @param {string | XYPoint} color String representing a hexadecimal color value (or an XYPoint)
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async setColor(
    lampIndex: number,
    color: string | XYPoint
  ): Promise<HueBridgeStateChangeResponse> {
    const cieColor: XYPoint =
      color instanceof XYPoint ? color : this.colors.getCIEColor(color);
    const xyState: States.ColorState = this.buildXYState(cieColor);

    const { data } = await this.put(lampIndex, xyState);

    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Set the color temperature of the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to colorize.
   * @param {number} colorTemperature Color temperature (in Kelvin) to set the lamp to (The approximate range is 2000 - 6000).
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call.
   */
  public async setColorTemperature(
    lampIndex: number,
    colorTemperature: number
  ): Promise<HueBridgeStateChangeResponse> {
    const clampedK = clampToRange(2000, 6000, colorTemperature);
    const convertedTemp = Math.floor(this.colors.kelvinToMired(clampedK));

    const { data } = await this.put(lampIndex, { ct: convertedTemp });

    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Sets all connected lamps to the approximate CIE x,y equivalent of
   * the provided hex color.
   *
   * @param {string} color String representing a hexadecimal color value.
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async setAllColors(
    color: string
  ): Promise<HueBridgeGroupActionResponse> {
    const cieColor: XYPoint = this.colors.getCIEColor(color);
    const xyState: States.ColorState = this.buildXYState(cieColor);

    const { data } = await this.putGroupAction(0, xyState);

    return new HueBridgeGroupActionResponse(data);
  }

  /**
   * Turn off the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to turn off.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async turnOff(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse> {
    const { data } = await this.put(lampIndex, offState);

    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Turn on the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to turn on.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async turnOn(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse> {
    const { data } = await this.put(lampIndex, onState);

    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Turn off all connected lamps.
   *
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async turnOffAll(): Promise<HueBridgeGroupActionResponse> {
    const { data } = await this.putGroupAction(0, offState);

    return new HueBridgeGroupActionResponse(data);
  }

  /**
   * Turn on all connected lamps.
   *
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async turnOnAll(): Promise<HueBridgeGroupActionResponse> {
    const { data } = await this.putGroupAction(0, onState);

    return new HueBridgeGroupActionResponse(data);
  }

  /**
   * Set the brightness of the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to modify.
   * @param {number} brightness Integer value between 0 and 254.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async setBrightness(
    lampIndex: number,
    brightness: number
  ): Promise<HueBridgeStateChangeResponse> {
    const briState = this.buildBrightnessState(brightness);
    const { data } = await this.put(lampIndex, briState);

    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Set the brightness of all connected lamps.
   *
   * @param {number} brightness Integer value between 0 and 254.
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async setAllBrightness(
    brightness: number
  ): Promise<HueBridgeGroupActionResponse> {
    return await this.setGroupBrightness(0, brightness);
  }

  /**
   * Set the brightness of an indexed group of lamps.
   *
   * @param {number} groupIndex 0-based lamp group index.
   * @param {number} brightness Integer value between 0 and 254.
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async setGroupBrightness(
    groupIndex: number,
    brightness: number
  ): Promise<HueBridgeGroupActionResponse> {
    const briState: States.BrightnessState = this.buildBrightnessState(
      brightness
    );
    const { data } = await this.putGroupAction(groupIndex, briState);

    return new HueBridgeGroupActionResponse(data);
  }

  /**
   * Dim the lamp at lampIndex by decrement.
   *
   * @param {number} lampIndex 1-based lamp index.
   * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async dim(
    lampIndex: number,
    decrement?: number
  ): Promise<HueBridgeStateChangeResponse> {
    const dimState: States.BrightnessIncrementState = this.buildDimState(
      decrement
    );
    const { data } = await this.put(lampIndex, dimState);

    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Dim all lamps by decrement.
   *
   * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async dimAll(
    decrement?: number
  ): Promise<HueBridgeGroupActionResponse> {
    const dimState: States.BrightnessIncrementState = this.buildDimState(
      decrement
    );
    const { data } = await this.putGroupAction(0, dimState);

    return new HueBridgeGroupActionResponse(data);
  }

  /**
   * Brighten the lamp at lampIndex by increment.
   *
   * @param {number} lampIndex 1-based lamp index.
   * @param {number} [increment] Amount to increment brightness by (between 0 and 255).
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async brighten(
    lampIndex: number,
    increment?: number
  ): Promise<HueBridgeStateChangeResponse> {
    const brightenState = this.buildBrightenState(increment);
    const { data } = await this.put(lampIndex, brightenState);

    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Brighten all lamps by increment.
   *
   * @param {number} increment Amount to increment brightness by (between 0 and 255).
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public async brightenAll(
    increment?: number
  ): Promise<HueBridgeGroupActionResponse> {
    const { data } = await this.putGroupAction(
      0,
      this.buildBrightenState(increment)
    );
    return new HueBridgeGroupActionResponse(data);
  }

  /**
   * Enable the colorloop effect on the indexed Hue lamp.
   *
   * @param {number} lampIndex The indexed lamp to enable the effect on
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async startColorLoop(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse> {
    const { data } = await this.put(lampIndex, colorLoopEffect);

    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Stop the currently enabled effect (if any) on the indexed Hue lamp.
   *
   * @param {number} lampIndex The indexed lamp to enable the effect on
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public async stopEffect(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse> {
    const { data } = await this.put(lampIndex, noEffect);
    return new HueBridgeStateChangeResponse(data);
  }

  /**
   * Get the attributes of all lamps currently connected to the Hue bridge.
   *
   * @return {Promise<States.LampState[]>} Promise representing the remote call
   */
  public async getLampStates(): Promise<States.LampState[]> {
    const lamps = await this.getLamps();
    return lamps.filter(l => l.state.reachable).map(l => l.state);
  }

  public async getLampState(index: number): Promise<States.LampState> {
    const { data } = await this.getState(index);
    return data.state;
  }

  /**
   * Get a collection of lamps that the local bridge is aware of.
   *
   * @return {Promise<Lamp[]>} Collection of known lamps.
   */
  public async getLamps(): Promise<Lamp[]> {
    const url = this.buildLampCompositeURL();
    const { data } = await this.get(url);
    return Object.keys(data).map(k => ({...data[k], lampIndex: parseInt(k)}));
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
   * Get the number of lamps available to control.
   */
  public getNumberOfLamps(): number {
    return this.config.numberOfLamps;
  }

  /**
   * Get a reference to the bundled color utility module.
   */
  public getColors(): HueColors {
    return this.colors;
  }

  /**
   * Get the currently set options.
   */
  public getConfig(): HueConfig {
    return this.config;
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
