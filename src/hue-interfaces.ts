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

export interface PoweredState {
    on?: boolean;
}

export interface AlertState {
    alert?: string;
}

export interface ColorState {
    xy?: number[];
}

export interface BrightnessState {
    bri?: number;
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
    AlertState, 
    ColorState, 
    BrightnessState, 
    HueState, 
    SaturationState, 
    ColorTempState {

}