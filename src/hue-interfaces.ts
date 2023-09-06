import { HueColors } from './hue-colors.js';

export interface HueConfig {
  /** API key / appname registered with the Hue bridge (requires physical access to the hardware to initially configure) */
  key: string;
  /** IP address of your connected Hue bridge */
  ip: string;
  /** Number of lamps that can be controlled by your Hue bridge (3 if no value supplied here) */
  numberOfLamps?: number;
  /** Flag indicating that the initial brightness state should be queried from the bridge */
  retrieveInitialState?: boolean;
  /** Number of milliseconds between lamp state changes */
  transitionTime?: number;
  /** Timeout (in milliseconds) of all remote bridge communication */
  timeout?: number;
}

export abstract class HueBridge {
  /**
   * Returns the brightness of the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the lamp to query.
   * @return {Promise<number>} Promise to retrieve the brightness of the lamp at lampIndex. 0 - 254.
   */
  public abstract getBrightness(lampIndex: number): Promise<number>;

  /**
   * Perform initialization of this Hue instance
   */
  public abstract init(): Promise<void>;

  /**
   * Flash the lamp at lampIndex for a short time.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to flash.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract flash(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Flash all connected lamps for a short time.
   *
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract flashAll(): Promise<HueBridgeGroupActionResponse>;

  /**
   * Flash the lamp at lampIndex for a long time.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to flash.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract longFlash(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Flash all connected lamps for a long time.
   *
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract longFlashAll(): Promise<HueBridgeGroupActionResponse>;

  /**
   * Set the lamp at lampIndex to the approximate CIE x,y equivalent of
   * the provided hex color.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to colorize.
   * @param {string} color String representing a hexadecimal color value.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract setColor(
    lampIndex: number,
    color: string
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Set the color temperature of the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to colorize.
   * @param {number} colorTemperature Color temperature (in Kelvin) to set the lamp to (The approximate range is 2000 - 6000).
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call.
   */
  public abstract setColorTemperature(
    lampIndex: number,
    colorTemperature: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Sets all connected lamps to the approximate CIE x,y equivalent of
   * the provided hex color.
   *
   * @param {string} color String representing a hexadecimal color value.
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract setAllColors(
    color: string
  ): Promise<HueBridgeGroupActionResponse>;

  /**
   * Turn off the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to turn off.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract turnOff(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Turn on the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to turn on.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract turnOn(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Turn off all connected lamps.
   *
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract turnOffAll(): Promise<HueBridgeGroupActionResponse>;

  /**
   * Turn on all connected lamps.
   *
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract turnOnAll(): Promise<HueBridgeGroupActionResponse>;

  /**
   * Set the brightness of the lamp at lampIndex.
   *
   * @param {number} lampIndex 1-based index of the Hue lamp to modify.
   * @param {number} brightness Integer value between 0 and 254.
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract setBrightness(
    lampIndex: number,
    brightness: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Set the brightness of all connected lamps.
   *
   * @param {number} brightness Integer value between 0 and 254.
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract setAllBrightness(
    brightness: number
  ): Promise<HueBridgeGroupActionResponse>;

  /**
   * Set the brightness of an indexed group of lamps.
   *
   * @param {number} groupIndex 0-based lamp group index.
   * @param {number} brightness Integer value between 0 and 254.
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract setGroupBrightness(
    groupIndex: number,
    brightness: number
  ): Promise<HueBridgeGroupActionResponse>;

  /**
   * Dim the lamp at lampIndex by decrement.
   *
   * @param {number} lampIndex 1-based lamp index.
   * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract dim(
    lampIndex: number,
    decrement?: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Dim all lamps by decrement.
   *
   * @param {number} [decrement] Amount to decrement brightness by (between 0 and 255).
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract dimAll(
    decrement?: number
  ): Promise<HueBridgeGroupActionResponse>;

  /**
   * Brighten the lamp at lampIndex by increment.
   *
   * @param {number} lampIndex 1-based lamp index.
   * @param {number} [increment] Amount to increment brightness by (between 0 and 255).
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract brighten(
    lampIndex: number,
    increment?: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Brighten all lamps by increment.
   *
   * @param {number} increment Amount to increment brightness by (between 0 and 255).
   * @return {Promise<HueBridgeGroupActionResponse>} Promise representing the remote call
   */
  public abstract brightenAll(
    increment?: number
  ): Promise<HueBridgeGroupActionResponse>;

  /**
   * Enable the colorloop effect on the indexed Hue lamp.
   *
   * @param {number} lampIndex The indexed lamp to enable the effect on
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract startColorLoop(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Stop the currently enabled effect (if any) on the indexed Hue lamp.
   *
   * @param {number} lampIndex The indexed lamp to enable the effect on
   * @return {Promise<HueBridgeStateChangeResponse>} Promise representing the remote call
   */
  public abstract stopEffect(
    lampIndex: number
  ): Promise<HueBridgeStateChangeResponse>;

  /**
   * Get the attributes of all lamps currently connected to the Hue bridge.
   *
   * @return {Promise<States.LampState[]>} Promise representing the remote call
   */
  public abstract getLampStates(): Promise<States.LampState[]>;

  /**
   * Get the attributes of a specifically indexed lamp.
   *
   * @param index 1-based index of the lamp for which to retrieve current state
   * @return {Promise<States.LampState} Promise representing the remote call
   */
  public abstract getLampState(index: number): Promise<States.LampState>;

  /**
   * Get a collection of lamps that the local bridge is aware of.
   *
   * @return {Promise<Lamp[]>} Collection of known lamps.
   */
  public abstract getLamps(): Promise<Lamp[]>;

  /**
   * Return the value of the configured transitionTime property.
   *
   * @return {number} Value of the transitionTime property. Null by default if not
   * set.
   */
  public abstract getTransitionTime(): number;

  /**
   * Set the value of the transitionTime property.
   *
   * @param {number} time Lamp color transition time in approximate milliseconds.
   */
  public abstract setTransitionTime(time: number): void;

  /**
   * Set the number of lamps available to control.
   *
   * @param {number} The total number of lamps available to interact with. Default is 3.
   */
  public abstract setnumberOfLamps(numLamps: number): void;

  /**
   * Get the number of lamps available to control.
   */
  public abstract getNumberOfLamps(): number;

  /**
   * Get a reference to the bundled color utility module.
   */
  public abstract getColors(): HueColors;

  /**
   * Get the currently set options.
   */
  public abstract getConfig(): HueConfig;
}

export interface IHueUPNPResponse {
  id: string;
  internalipaddress: string;
}

export class HueUPNPResponse implements IHueUPNPResponse {
  id: string;
  internalipaddress: string;

  constructor(data: any) {
    if (data) {
      if (data.id && typeof data.id === 'string') {
        this.id = data.id;
      }
      if (
        data.internalipaddress &&
        typeof data.internalipaddress === 'string'
      ) {
        this.internalipaddress = data.internalipaddress;
      }
    }
  }
}

export namespace States {
  export interface PoweredState {
    on?: boolean;
  }

  export type AlertOption = 'select' | 'lselect' | 'none';

  export interface AlertState {
    alert?: AlertOption;
  }

  export type EffectOption = 'colorloop' | 'none';

  export interface EffectState {
    effect?: EffectOption;
  }

  export interface ColorState {
    xy?: number[];
  }

  export interface BrightnessState {
    bri?: number;
  }

  export interface BrightnessIncrementState {
    bri_inc?: number;
  }

  export interface HueState {
    hue?: number;
  }

  export interface SaturationState {
    sat?: number;
  }

  export interface ColorTempState {
    ct?: number;
  }

  export type ColormodeOption = 'hs' | 'xy' | 'ct';

  export interface ColormodeState {
    colormode?: ColormodeOption;
  }

  export interface ReachableState {
    reachable?: boolean;
  }

  export interface FullLampState {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
    effect: EffectOption;
    xy: number[];
    ct: number;
    alert: AlertOption;
    colormode: ColormodeOption;
    reachable: boolean;
  }

  export type LampState = Partial<FullLampState>;
}

export interface Lamp {
  lampIndex: number;
  state: States.LampState;
  type: string;
  name: string;
  modelid: string;
  swversion: string;
  pointsymbol?: any;
}

export type HueStateValue = string | number | number[] | boolean;

export interface UpdateConfirmation {
  success: StateChangeConfirmation | GroupActionConfirmation;
}

export interface StateChangeConfirmation {
  attribute: string;
  value: HueStateValue;
}

export class HueBridgeStateChangeResponse {
  public changedStates: StateChangeConfirmation[];

  constructor(response: any[]) {
    let changedStates: StateChangeConfirmation[] = [];
    for (let update of response) {
      let changedState: StateChangeConfirmation;
      for (let key in update.success) {
        if (key.includes(`/lights/`) && key.includes(`/state/`)) {
          changedState = {
            attribute: key,
            value: update.success[key]
          };
        }
      }
      if (
        changedState !== undefined &&
        changedState.attribute !== undefined &&
        changedState.value !== undefined
      ) {
        changedStates.push(changedState);
      }
    }

    this.changedStates = changedStates;
  }
}

export interface GroupActionConfirmation {
  address: string;
  value: HueStateValue;
}

export class HueBridgeGroupActionResponse {
  public acknowledgedActions: GroupActionConfirmation[];

  constructor(response: any[]) {
    let acknowledgedActions: GroupActionConfirmation[] = [];
    for (let update of response) {
      acknowledgedActions.push(update.success);
    }

    this.acknowledgedActions = acknowledgedActions;
  }
}

/**
 * Clamp a provided value into a range such that min <= value <= max.
 * @param min Smallest possible acceptable value
 * @param max Largest possible acceptable value
 * @param value Value that must be between min and max, inclusive
 */
export function clampToRange(min: number, max: number, value: number): number {
  return Math.min(Math.max(min, value), max);
}

/**
 * Convenience wrapper class around the two floating point numbers that represent
 * a position in the CIE 1931 color gamut triangle.
 */
export class XYPoint {
  public x: number;
  public y: number;

  constructor(...xy: number[]) {
    this.x = xy[0];
    this.y = xy[1];
  }

  /**
   * Return a human readable representation of this XYPoint instance.
   */
  public toString(): string {
    return `{x: ${this.x}, y: ${this.y}}`;
  }
}

/**
 * Convenience wrapper class around the three 0-255 range integer values representing
 * a traditional RGB color.
 */
export class RGB {
  private static MIN = 0;
  private static MAX = 255;

  public r: number;
  public g: number;
  public b: number;

  constructor(...rgb: number[]) {
    this.r = clampToRange(RGB.MIN, RGB.MAX, rgb[0] || 0);
    this.g = clampToRange(RGB.MIN, RGB.MAX, rgb[1] || 0);
    this.b = clampToRange(RGB.MIN, RGB.MAX, rgb[2] || 0);
  }

  /**
   * Return a human-readable representation of this RGB color value.
   */
  public toString(): string {
    return `r: ${this.r}, g: ${this.g}, b: ${this.b}`;
  }

  /**
   * Return a usable CSS rgb() function notation representation of this RGB color value.
   */
  public toCssString(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}
