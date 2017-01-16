"use strict";
const index_1 = require("../index");
let test_constants = require('./hue-test-constants');
let hue = new index_1.Hue();
let colors = hue.getColors();
hue.setConfig({
    ip: "192.168.11.10",
    key: "9cf5fd0c39b5845d0b8099e9c0daf2cd"
});
module.exports['testCssColor'] = function (test) {
    test.deepEqual(hue.setColor(1, 'red'), test_constants.color_red);
    test.done();
};
module.exports['testCssColorAll'] = function (test) {
    test.deepEqual(hue.setAllColors("white"), test_constants.color_white);
    test.done();
};
const cieRGBRed = [0.6484272236872118, 0.330856101472778];
const hexRGBGreen = '00FF00';
const cieRGBGreen = [0.4091, 0.518];
const hexRGBBlue = '0000FF';
const cieRGBBlue = [0.167, 0.04];
module.exports['known parameter returns known coordinates (full red)'] = function (test) {
    test.deepEqual(colors.CIE1931ToHex(cieRGBRed[0], cieRGBRed[1]), 'ff6c22');
    test.done();
};
module.exports['known parameter returns known coordinates (full green)'] = function (test) {
    test.deepEqual(colors.CIE1931ToHex(cieRGBGreen[0], cieRGBGreen[1]), 'fffe50');
    test.done();
};
module.exports['known parameter returns known coordinates (full blue)'] = function (test) {
    test.deepEqual(colors.CIE1931ToHex(cieRGBBlue[0], cieRGBBlue[1]), '3639ff');
    test.done();
};
