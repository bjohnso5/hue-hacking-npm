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