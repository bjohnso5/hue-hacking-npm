/**
 * Color utility functions, exposed as an AMD module.
 * No external dependencies.
 * Special thanks for the RGB to CIE conversion code goes out to the Q42 team 
 * for their Q42.HueApi work. Dank u!
 * More info: https://github.com/Q42/Q42.HueApi.
 *
 * https://github.com/bjohnso5/hue-hacking
 * Copyright (c) 2013 Bryan Johnson; Licensed MIT */

import { CssColors } from './hue-css-colors';

class XYPoint {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export const Red = new XYPoint(0.675, 0.322);
export const Lime = new XYPoint(0.4091, 0.518);
export const Blue = new XYPoint(0.167, 0.04);

export const hexFullRed = "FF0000";
export const hexFullGreen = "00FF00";
export const hexFullBlue = "0000FF";
export const hexFullWhite = "FFFFFF";

export class HueColors {

    constructor() {
        this.cssColors = new CssColors();
    }

    private cssColors: CssColors;

    /**
     * Parses a valid hex color string and returns the Red RGB integer value.
     *
     * @param {String} Hex color string.
     * @return {Number} Red integer value.
     */    
    private hexToRed(hex: string): number {
        return parseInt( hex.substring(0, 2), 16 );
    }

    /**
     * Parses a valid hex color string and returns the Green RGB integer value.
     *
     * @param {String} Hex color string.
     * @return {Number} Green integer value.
     */    
    private hexToGreen(hex: string): number {
        return parseInt( hex.substring(2, 4), 16 );
    }

    /**
     * Parses a valid hex color string and returns the Blue RGB integer value.
     *
     * @param {String} Hex color string.
     * @return {Number} Blue integer value.
     */
    private hexToBlue(hex: string): number {
        return parseInt( hex.substring(4, 6), 16 );
    }

    /**
     * Converts a valid hex color string to an RGB array.
     *
     * @param {String} Hex color String (e.g. FF00FF)
     * @return {Array} Array containing R, G, B values
     */
    private hexToRGB(h: string): number[] {
        var rgb = [this.hexToRed(h), this.hexToGreen(h), this.hexToBlue(h)];
        return rgb;
    }

    /**
     * Converts an RGB component to a hex string.
     *
     * @param {Number} RGB value, integer between 0 and 255.
     * @returns {String} Hex value string (e.g. FF)
     */
    private componentToHex(c: number): string {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    /**
     * Converts RGB color components to a valid hex color string.
     *
     * @param {Number} RGB red value, integer between 0 and 255.
     * @param {Number} RGB green value, integer between 0 and 255.
     * @param {Number} RGB blue value, integer between 0 and 255.
     * @returns {String} Hex color string (e.g. FF0000)
     */
    private rgbToHex(r: number, g: number, b: number) {
        return this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    /**
     * Generates a random number between 'from' and 'to'.
     *
     * @param {Number} Number representing the start of a range.
     * @param {Number} Number representing the end of a range.
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
     * @param {XYPoint} Point 1.
     * @param {XYPoint} Point 2.
     * @return {Number} Cross-product of the two XYPoints provided.
     */
    private crossProduct(p1: XYPoint, p2: XYPoint): number {
        return (p1.x * p2.y - p1.y * p2.x);
    }

    /**
     * Check if the provided XYPoint can be recreated by a Hue lamp.
     *
     * @param {XYPoint} XYPoint to check.
     * @return {boolean} Flag indicating if the point is within reproducible range.
     */
    private checkPointInLampsReach(p: XYPoint) {
        var v1 = new XYPoint(Lime.x - Red.x, Lime.y - Red.y),
            v2 = new XYPoint(Blue.x - Red.x, Blue.y - Red.y),
        
            q = new XYPoint(p.x - Red.x, p.y - Red.y),
        
            s = this.crossProduct(q, v2) / this.crossProduct(v1, v2),
            t = this.crossProduct(v1, q) / this.crossProduct(v1, v2);
        
        return (s >= 0.0) && (t >= 0.0) && (s + t <= 1.0);
    }

    /**
     * Find the closest point on a line. This point will be reproducible by a Hue lamp.
     *
     * @param {XYPoint} The point where the line starts.
     * @param {XYPoint} The point where the line ends.
     * @param {XYPoint} The point which is close to the line.
     * @return {XYPoint} A point that is on the line, and closest to the XYPoint provided.
     */
    private getClosestPointToLine(A: XYPoint, B: XYPoint, P: XYPoint): XYPoint {
        var AP = new XYPoint(P.x - A.x, P.y - A.y),
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
     * @param {XYPoint} The point to find the closest reproducible point to.
     * @return {XYPoint} The closest Hue-reproducible point to the provided point.
     */
    private getClosestPointToPoint(xyPoint: XYPoint): XYPoint {
        // Color is unreproducible, find the closest point on each line in the CIE 1931 'triangle'.
        let pAB = this.getClosestPointToLine(Red, Lime, xyPoint),
            pAC = this.getClosestPointToLine(Blue, Red, xyPoint),
            pBC = this.getClosestPointToLine(Lime, Blue, xyPoint),

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
     * @param {XYPoint} The first point.
     * @param {XYPoint} The second point.
     * @param {Number} The distance between points one and two.
     */
    private getDistanceBetweenTwoPoints(one: XYPoint, two: XYPoint): number {
        var dx = one.x - two.x, // horizontal difference
            dy = one.y - two.y; // vertical difference
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Returns an XYPoint object containing the closest available CIE 1931
     * coordinates based on the RGB input values.
     *
     * @param {Number} RGB red value, integer between 0 and 255.
     * @param {Number} RGB green value, integer between 0 and 255.
     * @param {Number} RGB blue value, integer between 0 and 255.
     * @return {XYPoint} CIE 1931 XY coordinates, corrected for reproducibility.
     */
    private getXYPointFromRGB(red: number, green: number, blue: number): XYPoint {
        
        let r = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92),
            g = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92),
            b = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92),

            X = r * 0.4360747 + g * 0.3850649 + b * 0.0930804,
            Y = r * 0.2225045 + g * 0.7168786 + b * 0.0406169,
            Z = r * 0.0139322 + g * 0.0971045 + b * 0.7141733,

            cx = X / (X + Y + Z),
            cy = Y / (X + Y + Z);

        cx = isNaN(cx) ? 0.0 : cx;
        cy = isNaN(cy) ? 0.0 : cy;

        //Check if the given XY value is within the colourreach of our lamps.
        var xyPoint = new XYPoint(cx, cy),
            inReachOfLamps = this.checkPointInLampsReach(xyPoint);

        if (!inReachOfLamps) {
            var closestPoint = this.getClosestPointToPoint(xyPoint);
            cx = closestPoint.x;
            cy = closestPoint.y;
        }

        return new XYPoint(cx, cy);
    }

    /**
     * Returns a rgb array for given x, y values. Not actually an inverse of
     * getXYPointFromRGB. Implementation of the instructions found on the
     * Philips Hue iOS SDK docs: http://goo.gl/kWKXKl
     */
    private getRGBFromXYAndBrightness(x: number, y: number, bri: number): number[] {
        let xyPoint = new XYPoint(x, y);

        if (bri === undefined) {
            bri = 1;
        }

        // Check if the xy value is within the color gamut of the lamp.
        // If not continue with step 2, otherwise step 3.
        // We do this to calculate the most accurate color the given light can actually do.
        if (! this.checkPointInLampsReach(xyPoint)) {
            // Calculate the closest point on the color gamut triangle
            // and use that as xy value See step 6 of color to xy.
            xyPoint = this.getClosestPointToPoint(xyPoint);
        }

        // Calculate XYZ values Convert using the following formulas:
        let Y = bri,
            X = (Y / xyPoint.y) * xyPoint.x,
            Z = (Y / xyPoint.y) * (1 - xyPoint.x - xyPoint.y);

        // Convert to RGB using Wide RGB D65 conversion.
        let rgb =  [
             X * 1.612 - Y * 0.203 - Z * 0.302,
            -X * 0.509 + Y * 1.412 + Z * 0.066,
             X * 0.026 - Y * 0.072 + Z * 0.962
        ];

        // Apply reverse gamma correction.
        rgb = rgb.map(function (x) {
            return (x <= 0.0031308) ? (12.92 * x) : ((1.0 + 0.055) * Math.pow(x, (1.0 / 2.4)) - 0.055);
        });

        // Bring all negative components to zero.
        rgb = rgb.map(function (x) { return Math.max(0, x); });

        // If one component is greater than 1, weight components by that value.
        const max = Math.max(rgb[0], rgb[1], rgb[2]);
        if (max > 1) {
            rgb = rgb.map(function (x) { return x / max; });
        }

        rgb = rgb.map(function (x) { return Math.floor(x * 255); });

        return rgb;
    }
    
    /**
     * Converts hexadecimal colors represented as a String to approximate
     * CIE 1931 coordinates. May not produce accurate values.
     *
     * @param {String} Value representing a hexadecimal color value
     * @return {Array{Number}} Approximate CIE 1931 x,y coordinates.
     */
    public hexToCIE1931(h: string): number[] {
        let rgb = this.hexToRGB(h);
        return this.rgbToCIE1931(rgb[0], rgb[1], rgb[2]);
    }

    /**
     * Converts red, green and blue integer values to approximate CIE 1931
     * x and y coordinates. Algorithm from: 
     * http://www.easyrgb.com/index.php?X=MATH&H=02#text2. May not produce
     * accurate values.
     *
     * @param {Number} red Integer in the 0-255 range.
     * @param {Number} green Integer in the 0-255 range.
     * @param {Number} blue Integer in the 0-255 range.
     * @return {Array{Number}} Approximate CIE 1931 x,y coordinates.
     */
    public rgbToCIE1931(red: number, green: number, blue: number): number[] {
        let point = this.getXYPointFromRGB(red, green, blue);
        return [point.x, point.y];
    }

    /**
     * Returns the approximate CIE 1931 x,y coordinates represented by the 
     * supplied hexColor parameter, or of a random color if the parameter
     * is not passed.
     *
     * @param {String} hexColor String representing a hexidecimal color value OR a named CSS color (e.g. "red", "yellow", etc.).
     * @return {Array{Number}} Approximate CIE 1931 x,y coordinates.
     */
    public getCIEColor(hexColor: string): number[] {
        let hex = hexColor || null,
            xy = [],
            lowerCaseHex = hex !== null ? hexColor.toString().toLowerCase() : null,
            cssColor = this.cssColors.getHexCode(lowerCaseHex);
        if(cssColor !== undefined) {
            xy = this.hexToCIE1931(cssColor);
        } else if (null !== hex) {
            xy = this.hexToCIE1931(hex);
        } else {
            let r = this.randomRGBValue(),
                g = this.randomRGBValue(),
                b = this.randomRGBValue();
            xy = this.rgbToCIE1931(r, g, b);
        }
        return xy;
    }

    /**
     * Returns the approximate hexColor represented by the supplied
     * CIE 1931 x,y coordinates and brightness value.
     *
     * @param {Number} X coordinate.
     * @param {Number} Y coordinate.
     * @param {Number} brightness value expressed between 0 and 1.
     * @return {String} hex color string.
     */
    public CIE1931ToHex(x: number, y: number, bri?: number): string {
        if (bri === undefined) {
            bri = 1;
        }
        let rgb = this.getRGBFromXYAndBrightness(x, y, bri);
        return this.rgbToHex(rgb[0], rgb[1], rgb[2]);
    }

}
