
export const state_off = (lightIndex: number) => {
  return {
    attribute: `/lights/${lightIndex}/state/on`,
    value: false  
  }
};
export const state_on = (lightIndex: number) => {
   return {
    attribute: `/lights/${lightIndex}/state/on`,
    value: true  
  }
};

export const group_off = (groupIndex: number) => {
  return {
    "address": `/groups/${groupIndex}/action/on`,
    "value": false
  };
};
export const group_on = (groupIndex: number) => {
  return {
    "address": `/groups/${groupIndex}/action/on`,
    "value": true
  };
};
export const color_red: number[] = [ 0.6484272236872118, 0.330856101472778 ];
export const color_red_response: any = { attribute: "/lights/1/state/xy", value: color_red };
export const color_white: number[] = [ 0.33618074375880236, 0.3603696362840742 ];
export const color_white_response: any = [{"success": { address: "/groups/0/action/xy", value: [ 0.33618074375880236, 0.3603696362840742 ] } }];
export const full_brightness: any = 254;
export const no_brightness: any = 1;
