import {
  StateChangeConfirmation,
  GroupActionConfirmation,
  Lamp
} from './hue-interfaces';
export const state_off = (lightIndex: number): StateChangeConfirmation => {
  return {
    attribute: `/lights/${lightIndex}/state/on`,
    value: false
  };
};
export const state_on = (lightIndex: number): StateChangeConfirmation => {
  return {
    attribute: `/lights/${lightIndex}/state/on`,
    value: true
  };
};

export const group_off = (groupIndex: number): GroupActionConfirmation => {
  return {
    address: `/groups/${groupIndex}/action/on`,
    value: false
  };
};
export const group_on = (groupIndex: number): GroupActionConfirmation => {
  return {
    address: `/groups/${groupIndex}/action/on`,
    value: true
  };
};
export const color_red: number[] = [0.6484272236872118, 0.330856101472778];
export const color_red_response: any = {
  attribute: '/lights/1/state/xy',
  value: color_red
};
export const color_white: number[] = [0.33618074375880236, 0.3603696362840742];
export const color_white_response: any = [
  {
    success: {
      address: '/groups/0/action/xy',
      value: [0.33618074375880236, 0.3603696362840742]
    }
  }
];
export const full_brightness: any = 254;
export const no_brightness: any = 1;

export const lamp_response: any = {
  '1': {
    state: {
      on: true,
      bri: 144,
      hue: 13088,
      sat: 212,
      xy: [0.5128, 0.4147],
      ct: 467,
      alert: 'none',
      effect: 'none',
      colormode: 'xy',
      reachable: true
    },
    type: 'Extended color light',
    name: 'Hue Lamp 1',
    modelid: 'LCT001',
    swversion: '66009461',
    pointsymbol: {
      '1': 'none',
      '2': 'none',
      '3': 'none',
      '4': 'none',
      '5': 'none',
      '6': 'none',
      '7': 'none',
      '8': 'none'
    }
  },
  '2': {
    state: {
      on: false,
      bri: 0,
      hue: 0,
      sat: 0,
      xy: [0, 0],
      ct: 0,
      alert: 'none',
      effect: 'none',
      colormode: 'hs',
      reachable: false
    },
    type: 'Extended color light',
    name: 'Hue Lamp 2',
    modelid: 'LCT001',
    swversion: '66009461',
    pointsymbol: {
      '1': 'none',
      '2': 'none',
      '3': 'none',
      '4': 'none',
      '5': 'none',
      '6': 'none',
      '7': 'none',
      '8': 'none'
    }
  }
};

export const lamps: Lamp[] = [lamp_response['1'], lamp_response['2']];
