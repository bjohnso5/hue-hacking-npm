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

export interface IHueUPNPResponse {
    id: string;
    internalipaddress: string;
}

export class HueUPNPResponse implements IHueUPNPResponse {
    
    id: string;
    internalipaddress: string;
    
    constructor(data: any) {
        if(data.id && typeof data.id === 'string') {
            this.id = data.id;
        }
        if(data.internalipaddress && typeof data.internalipaddress === 'string') {
            this.internalipaddress = data.internalipaddress;
        }
    }
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

    export type ColormodeOption = "hs" | "xy" | "ct";

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
        colortemp: number;
        alert: AlertOption;
        colormode: ColormodeOption;
        reachable: boolean;
    }

    export type LampState = Partial<FullLampState>;
}

export interface Lamp {
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
        for(let update of response) {
            let changedState: StateChangeConfirmation;
            for(let key in update.success) {
                if(key.includes(`/lights/`) && key.includes(`/state/`)) {
                    changedState = {
                        attribute: key,
                        value: update.success[key]
                    };
                }
            }
            if(changedState !== undefined && 
               changedState.attribute !== undefined && 
               changedState.value !== undefined) { 
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
        for(let update of response) {
            acknowledgedActions.push(update.success);
        }
        this.acknowledgedActions = acknowledgedActions;
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
        this.r = this.clampToRange(rgb[0]||0);
        this.g = this.clampToRange(rgb[1]||0);
        this.b = this.clampToRange(rgb[2]||0);
    }

    private clampToRange(value: number): number {
        return Math.min(Math.max(0, value), 255);
    }

    public toString(): string {
        return `r: ${this.r}, g: ${this.g}, b: ${this.b}`;
    }

    public toCssString(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
}
