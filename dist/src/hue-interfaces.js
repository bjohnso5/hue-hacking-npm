"use strict";
class XYPoint {
    constructor(...xy) {
        this.x = xy[0];
        this.y = xy[1];
    }
}
exports.XYPoint = XYPoint;
class RGB {
    constructor(...rgb) {
        this.r = this.clampToRange(rgb[0]);
        this.g = this.clampToRange(rgb[1]);
        this.b = this.clampToRange(rgb[2]);
    }
    clampToRange(value) {
        if (value === undefined) {
            value = 0;
        }
        return Math.min(Math.max(0, value), 255);
    }
    toString() {
        return `r: ${this.r}, g: ${this.g}, b: ${this.b}`;
    }
}
exports.RGB = RGB;
