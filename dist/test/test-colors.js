"use strict";
const index_1 = require("../index");
let hue = new index_1.Hue();
let colors = hue.getColors();
const hexRGBRed = 'ff6c22';
const cieRGBRed = [0.6484272236872118, 0.330856101472778];
const hexRGBGreen = 'fffe50';
const cieRGBGreen = [0.4091, 0.518];
const hexRGBBlue = '3639ff';
const cieRGBBlue = [0.167, 0.04];
module.exports = {
    "known parameter returns known coordinates (full red)": function (test) {
        test.deepEqual(colors.CIE1931ToHex(cieRGBRed[0], cieRGBRed[1]), hexRGBRed);
        test.done();
    },
    "known parameter returns known coordinates (full green)": function (test) {
        test.deepEqual(colors.CIE1931ToHex(cieRGBGreen[0], cieRGBGreen[1]), hexRGBGreen);
        test.done();
    },
    "known parameter returns known coordinates (full blue with brightness)": function (test) {
        test.deepEqual(colors.CIE1931ToHex(cieRGBBlue[0], cieRGBBlue[1], 1), hexRGBBlue);
        test.done();
    },
    "getCIEColor full blue": function (test) {
        test.deepEqual(colors.getCIEColor('0000f'), cieRGBBlue);
        test.done();
    }
};
