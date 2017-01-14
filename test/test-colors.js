var hue = require('../lib/hue-node');
var test_constants = require('../lib/hue-test-constants');

hue.setConfig({
	ip: "192.168.11.10",
	key: "9cf5fd0c39b5845d0b8099e9c0daf2cd"
});

exports['testCssColor'] = function(test) {
	test.deepEqual(hue.setColor(1, 'red'), test_constants.color_red);
	test.done();
};

exports['testCssColorAll'] = function(test) {
	test.deepEqual(hue.setAllColors("white"), test_constants.color_white);
	test.done();
};

var cieRGBRed = [0.6484272236872118, 0.330856101472778];
var hexRGBGreen = '00FF00';
var cieRGBGreen = [0.4091, 0.518];
var hexRGBBlue = '0000FF';
var cieRGBBlue = [0.167, 0.04];

exports['known parameter returns known coordinates (full red)'] = function(test) {
	test.deepEqual(hue.colors.CIE1931ToHex.apply(null, cieRGBRed), 'ff6c22');
	test.done();
};

exports['known parameter returns known coordinates (full green)'] = function(test) {
	test.deepEqual(hue.colors.CIE1931ToHex.apply(null, cieRGBGreen), 'fffe50');
	test.done();
};

exports['known parameter returns known coordinates (full blue)'] = function(test) {
	test.deepEqual(hue.colors.CIE1931ToHex.apply(null, cieRGBBlue), '3639ff');
	test.done();
};
