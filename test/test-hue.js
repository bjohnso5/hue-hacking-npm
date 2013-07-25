var hue = require('../lib/hue-node');
var test_constants = require('../lib/hue-test-constants');

hue.setConfig({
	ip: "192.168.11.10",
	key: "9cf5fd0c39b5845d0b8099e9c0daf2cd"
});

exports['turnOffLamp1'] = function(test) {
	test.deepEqual(hue.turnOff(1), test_constants.state_off);
	test.done();
};

exports['turnOnLamp1'] = function(test) {
	test.deepEqual(hue.turnOn(1), test_constants.state_on);
	test.done();
};

exports['turnOffAll'] = function(test) {
	test.deepEqual(hue.turnOffAll(), test_constants.state_off);
	test.done();
};

exports['turnOnAll'] = function(test) {
	test.deepEqual(hue.turnOnAll(), test_constants.state_on);
	test.done();
};