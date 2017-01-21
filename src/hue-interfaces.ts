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
}

export module States {
    export interface PoweredState {
        on?: boolean;
    }

    export type AlertOption = "select" | "lselect" | "none";

    export interface AlertState {
        alert?: AlertOption;
    }

    export type EffectOption = "colorloop" | "none";

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

    export interface LampState extends 
        PoweredState, 
        EffectState, 
        AlertState, 
        ColorState, 
        BrightnessState, 
        HueState, 
        SaturationState, 
        ColorTempState {

    }
}

export class XYPoint {
    x: number;
    y: number;

    constructor(...xy: number[]) {
        this.x = xy[0];
        this.y = xy[1];
    }

    public toString(): string {
        return `{x: ${this.x}, y: ${this.y}}`;
    }
}

export class RGB {
    public r: number;
    public g: number;
    public b: number;

    constructor(...rgb: number[]) {
        this.r = this.clampToRange(rgb[0]);
        this.g = this.clampToRange(rgb[1]);
        this.b = this.clampToRange(rgb[2]);
    }

    private clampToRange(value: number): number {
        return Math.min(Math.max(0, value), 255);
    }

    public toString(): string {
        return `r: ${this.r}, g: ${this.g}, b: ${this.b}`;
    }
}

/**
 * Debug-only output
 */
export function __debug(message: string) {
    if(process.env.DEBUG) {
        console.log(message);
    }
}