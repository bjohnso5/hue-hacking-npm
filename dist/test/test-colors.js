"use strict";
const index_1 = require("../index");
const ava_1 = require("ava");
let hue = new index_1.Hue();
let colors = hue.getColors();
const hexRGBRed = 'ff6c22';
const cieRGBRed = { x: 0.6484272236872118, y: 0.330856101472778 };
const hexRGBGreen = 'fffe50';
const cieRGBGreen = { x: 0.4091, y: 0.518 };
const hexRGBBlue = '3639ff';
const cieRGBBlue = { x: 0.167, y: 0.04 };
function closeEnoughForGovernmentWork(actual, expected) {
    const epsilon = 1e-7, dX = Math.abs(actual.x - expected.x), dY = Math.abs(actual.y - expected.y);
    return dX < epsilon && dY < epsilon;
}
ava_1.default('known parameter returns known coordinates (full red)', t => {
    t.is(colors.CIE1931ToHex(cieRGBRed), hexRGBRed);
});
ava_1.default('known parameter returns known coordinates (full green)', t => {
    t.is(colors.CIE1931ToHex(cieRGBGreen), hexRGBGreen);
});
ava_1.default('known parameter returns known coordinates (full blue with brightness)', t => {
    t.is(colors.CIE1931ToHex(cieRGBBlue, 1), hexRGBBlue);
});
ava_1.default('getCIEColor full blue', t => {
    t.true(closeEnoughForGovernmentWork(colors.getCIEColor('0000f'), cieRGBBlue));
});
