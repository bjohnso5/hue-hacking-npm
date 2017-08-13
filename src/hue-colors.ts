/**
 * Color utility functions, exposed as a Typescript class.
 * No external dependencies.
 * Special thanks for the RGB to CIE conversion code goes out to the Q42 team 
 * for their Q42.HueApi work. Dank u!
 * More info: https://github.com/Q42/Q42.HueApi.
 *
 * https://github.com/bjohnso5/hue-hacking
 * Copyright (c) 2013 Bryan Johnson; Licensed MIT */

import { CssColors } from './hue-css-colors';
import { RGB, XYPoint } from './hue-interfaces';

export const CIERed = new XYPoint(0.675, 0.322);
export const CIELime = new XYPoint(0.4091, 0.518);
export const CIEBlue = new XYPoint(0.167, 0.04);

export const hexFullRed = 'FF0000';
export const hexFullGreen = '00FF00';
export const hexFullBlue = '0000FF';
export const hexFullWhite = 'FFFFFF';

export class HueColors {
  constructor() {
    this.cssColors = new CssColors();
  }

  private cssColors: CssColors;

  /**
     * Parses a valid hex color string and returns the Red RGB integer value.
     *
     * @param {string} Hex color string.
     * @return {number} Red integer value.
     */

  private hexToRed(hex: string): number {
    return parseInt(hex.substring(0, 2), 16);
  }

  /**
     * Parses a valid hex color string and returns the Green RGB integer value.
     *
     * @param {string} Hex color string.
     * @return {number} Green integer value.
     */

  private hexToGreen(hex: string): number {
    return parseInt(hex.substring(2, 4), 16);
  }

  /**
     * Parses a valid hex color string and returns the Blue RGB integer value.
     *
     * @param {string} Hex color string.
     * @return {number} Blue integer value.
     */
  private hexToBlue(hex: string): number {
    return parseInt(hex.substring(4, 6), 16);
  }

  /**
     * Converts a valid hex color string to an RGB array.
     *
     * @param {string} Hex color String (e.g. FF00FF)
     * @return {Array<number>} Array containing R, G, B values
     */
  private hexToRGB(h: string): RGB {
    return new RGB(this.hexToRed(h), this.hexToGreen(h), this.hexToBlue(h));
  }

  /**
     * Converts an RGB component to a hex string.
     *
     * @param {number} RGB value, integer between 0 and 255.
     * @returns {string} Hex value string (e.g. FF)
     */
  private componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  /**
     * Converts RGB color components to a valid hex color string.
     *
     * @param {number[]} RGB components with values between 0 and 255.
     * @returns {string} Hex color string (e.g. FF0000)
     */
  private rgbToHex(rgb: RGB) {
    return (
      this.componentToHex(rgb.r) +
      this.componentToHex(rgb.g) +
      this.componentToHex(rgb.b)
    );
  }

  /**
     * Generates a random number between 'from' and 'to'.
     *
     * @param {number} from Number representing the start of a range.
     * @param {number} to Number representing the end of a range.
     */
  private randomFromInterval(from: number, to: number): number {
    return Math.floor(Math.random() * (to - from + 1) + from);
  }

  /**
     * Return a random Integer in the range of 0 to 255, representing an RGB
     * color value.
     *
     * @return {number} Integer between 0 and 255.
     */
  private randomRGBValue(): number {
    return this.randomFromInterval(0, 255);
  }

  /**
     * Returns the cross product of two XYPoints.
     *
     * @param {XYPoint} p1 Point 1
     * @param {XYPoint} p2 Point 2
     * @return {number} Cross-product of the two XYPoints provided
     */
  private crossProduct(p1: XYPoint, p2: XYPoint): number {
    return p1.x * p2.y - p1.y * p2.x;
  }

  /**
     * Check if the provided XYPoint can be recreated by a Hue lamp.
     *
     * @param {XYPoint} XYPoint to check
     * @return {boolean} Flag indicating if the point is within reproducible range
     */
  private checkPointInLampsReach(p: XYPoint): boolean {
    const v1 = new XYPoint(CIELime.x - CIERed.x, CIELime.y - CIERed.y),
      v2 = new XYPoint(CIEBlue.x - CIERed.x, CIEBlue.y - CIERed.y),
      q = new XYPoint(p.x - CIERed.x, p.y - CIERed.y),
      s = this.crossProduct(q, v2) / this.crossProduct(v1, v2),
      t = this.crossProduct(v1, q) / this.crossProduct(v1, v2);

    return s >= 0.0 && t >= 0.0 && s + t <= 1.0;
  }

  /**
     * Find the closest point on a line. This point will be reproducible by a Hue lamp.
     *
     * @param {XYPoint} A The point where the line starts
     * @param {XYPoint} B The point where the line ends
     * @param {XYPoint} P The point which is close to the line
     * @return {XYPoint} A point that is on the line, and closest to the XYPoint provided
     */
  private getClosestPointToLine(A: XYPoint, B: XYPoint, P: XYPoint): XYPoint {
    let AP = new XYPoint(P.x - A.x, P.y - A.y),
      AB = new XYPoint(B.x - A.x, B.y - A.y),
      ab2 = AB.x * AB.x + AB.y * AB.y,
      ap_ab = AP.x * AB.x + AP.y * AB.y,
      t = ap_ab / ab2;

    if (t < 0.0) {
      t = 0.0;
    } else if (t > 1.0) {
      t = 1.0;
    }

    return new XYPoint(A.x + AB.x * t, A.y + AB.y * t);
  }

  /**
     * Find the closest Hue-producivle point to a provided point.
     *
     * @param {XYPoint} xyPoint The point to find the closest reproducible point to
     * @return {XYPoint} The closest Hue-reproducible point to the provided point
     */
  private getClosestPointToPoint(xyPoint: XYPoint): XYPoint {
    // Color is unreproducible, find the closest point on each line in the CIE 1931 'triangle'.
    let pAB = this.getClosestPointToLine(CIERed, CIELime, xyPoint),
      pAC = this.getClosestPointToLine(CIEBlue, CIERed, xyPoint),
      pBC = this.getClosestPointToLine(CIELime, CIEBlue, xyPoint),
      // Get the distances per point and see which point is closer to our Point.
      dAB = this.getDistanceBetweenTwoPoints(xyPoint, pAB),
      dAC = this.getDistanceBetweenTwoPoints(xyPoint, pAC),
      dBC = this.getDistanceBetweenTwoPoints(xyPoint, pBC),
      lowest = dAB,
      closestPoint = pAB;

    if (dAC < lowest) {
      lowest = dAC;
      closestPoint = pAC;
    }

    if (dBC < lowest) {
      lowest = dBC;
      closestPoint = pBC;
    }

    return closestPoint;
  }

  /**
     * Returns the distance between two XYPoints.
     *
     * @param {XYPoint} one The first point
     * @param {XYPoint} two The second point
     * @return {number} The distance between points one and two
     */
  private getDistanceBetweenTwoPoints(one: XYPoint, two: XYPoint): number {
    const dx = one.x - two.x, // horizontal difference
      dy = one.y - two.y; // vertical difference

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
     * Returns an XYPoint object containing the closest available CIE 1931
     * coordinates based on the RGB input values.
     *
     * @param {RGB} rgb RGB color object
     * @return {XYPoint} CIE 1931 XY coordinates, corrected for reproducibility
     */
  private getXYPointFromRGB(rgb: RGB): XYPoint {
    let r =
        rgb.r > 0.04045
          ? Math.pow((rgb.r + 0.055) / (1.0 + 0.055), 2.4)
          : rgb.r / 12.92,
      g =
        rgb.g > 0.04045
          ? Math.pow((rgb.g + 0.055) / (1.0 + 0.055), 2.4)
          : rgb.g / 12.92,
      b =
        rgb.b > 0.04045
          ? Math.pow((rgb.b + 0.055) / (1.0 + 0.055), 2.4)
          : rgb.b / 12.92,
      X = r * 0.4360747 + g * 0.3850649 + b * 0.0930804,
      Y = r * 0.2225045 + g * 0.7168786 + b * 0.0406169,
      Z = r * 0.0139322 + g * 0.0971045 + b * 0.7141733,
      cx = X / (X + Y + Z),
      cy = Y / (X + Y + Z);

    cx = isNaN(cx) ? 0.0 : cx;
    cy = isNaN(cy) ? 0.0 : cy;

    //Check if the given XY value is within the colourreach of our lamps.
    let xyPoint = new XYPoint(cx, cy),
      inReachOfLamps = this.checkPointInLampsReach(xyPoint);

    if (!inReachOfLamps) {
      let closestPoint = this.getClosestPointToPoint(xyPoint);
      cx = closestPoint.x;
      cy = closestPoint.y;
    }

    return new XYPoint(cx, cy);
  }

  /**
     * Returns a rgb array for given x, y values. Not actually an inverse of
     * getXYPointFromRGB. Implementation of the instructions found on the
     * Philips Hue iOS SDK docs: http://goo.gl/kWKXKl
     * 
     * @param {XYPoint} coords CIE 1931 x,y coordinates
     * @param {number} bri Brightness value between 0 and 1
     * @return {RGB} RGB color object
     */
  private getRGBFromXYAndBrightness(coords: XYPoint, bri: number): RGB {
    // Check if the xy value is within the color gamut of the lamp.
    // If not continue with step 2, otherwise step 3.
    // We do this to calculate the most accurate color the given light can actually do.
    if (!this.checkPointInLampsReach(coords)) {
      // Calculate the closest point on the color gamut triangle
      // and use that as xy value See step 6 of color to xy.
      coords = this.getClosestPointToPoint(coords);
    }

    // Calculate XYZ values Convert using the following formulas:
    let Y = bri,
      X = Y / coords.y * coords.x,
      Z = Y / coords.y * (1 - coords.x - coords.y);

    // Convert to RGB using Wide RGB D65 conversion.
    let rgb = [
      X * 1.612 - Y * 0.203 - Z * 0.302,
      -X * 0.509 + Y * 1.412 + Z * 0.066,
      X * 0.026 - Y * 0.072 + Z * 0.962
    ];

    // Apply reverse gamma correction.
    rgb = rgb.map(function(x) {
      return x <= 0.0031308
        ? 12.92 * x
        : (1.0 + 0.055) * Math.pow(x, 1.0 / 2.4) - 0.055;
    });

    // Bring all negative components to zero.
    rgb = rgb.map(function(x) {
      return Math.max(0, x);
    });

    // If one component is greater than 1, weight components by that value.
    const max = Math.max(rgb[0], rgb[1], rgb[2]);
    if (max > 1) {
      rgb = rgb.map(function(x) {
        return x / max;
      });
    }

    rgb = rgb.map(function(x) {
      return Math.floor(x * 255);
    });

    return new RGB(...rgb);
  }

  /**
     * Converts hexadecimal colors represented as a String to approximate
     * CIE 1931 coordinates. May not produce accurate values.
     *
     * @param {string} Value representing a hexadecimal color value
     * @return {XYPoint} Approximate CIE 1931 x,y coordinates
     */
  public hexToCIE1931(h: string): XYPoint {
    const rgb = this.hexToRGB(h);
    return this.rgbToCIE1931(rgb);
  }

  /**
     * Converts red, green and blue integer values to approximate CIE 1931
     * x and y coordinates. Algorithm from: 
     * http://www.easyrgb.com/index.php?X=MATH&H=02#text2. May not produce
     * accurate values.
     *
     * @param {RGB} rgb RGB color object
     * @return {XYPoint} Approximate CIE 1931 x,y coordinates
     */
  public rgbToCIE1931(rgb: RGB): XYPoint {
    return this.getXYPointFromRGB(rgb);
  }

  /**
     * Returns the approximate CIE 1931 x,y coordinates represented by the 
     * supplied hexColor parameter, or of a random color if the parameter
     * is not passed.
     *
     * @param {string} hexColor String representing a hexidecimal color value OR a named CSS color (e.g. "red", "yellow", etc.)
     * @return {XYPoint} Approximate CIE 1931 x,y coordinates
     */
  public getCIEColor(hexColor?: string): XYPoint {
    let hex = hexColor || null,
      xy: XYPoint = null,
      lowerCaseHex = hex !== null ? hexColor.toString().toLowerCase() : null,
      cssColor = this.cssColors.getHexCode(lowerCaseHex);
    if (cssColor !== undefined) {
      xy = this.hexToCIE1931(cssColor);
    } else if (null !== hex) {
      xy = this.hexToCIE1931(hex);
    } else {
      let rgb = new RGB(
        this.randomRGBValue(),
        this.randomRGBValue(),
        this.randomRGBValue()
      );
      xy = this.rgbToCIE1931(rgb);
    }
    return xy;
  }

  /**
     * Returns the approximate hexColor represented by the supplied
     * CIE 1931 x,y coordinates and brightness value.
     *
     * @param {XYPoint} coords CIE 1931 coordinates
     * @param {number} bri value expressed between 0 and 1
     * @return {string} hex color string
     */
  public CIE1931ToHex(coords: XYPoint, bri?: number): string {
    if (bri === undefined) {
      bri = 1;
    }
    const rgb = this.getRGBFromXYAndBrightness(coords, bri);
    return this.rgbToHex(rgb);
  }

  /**
     * Returns the approximate RGB values represented by the supplied
     * CIE 1931 x,y coordinates and brightness value.
     * 
     * @param {XYPoint} coords CIE 1931 coordinates
     * @param {number} bri Brightness value expressed between 0 and 1
     * @return {string} CSS rgb color expression
     */
  public CIE1931ToRGB(coords: XYPoint, bri?: number): RGB {
    if (bri === undefined) {
      bri = 1;
    }
    const rgb = this.getRGBFromXYAndBrightness(coords, bri);
    return rgb;
  }

  /**
     * Convert a Mired temperature to its Kelvin equivalent.
     */
  public miredToKelvin(mired: number): number {
    return 1e6 / mired;
  }

  /**
     * Convert a Kelvin temperature to its Mired equivalent.
     */
  public kelvinToMired(kelvin: number): number {
    return 1e6 / kelvin;
  }
}
