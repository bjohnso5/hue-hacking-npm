import { Hue } from '../index';
let test_constants = require('./hue-test-constants');

let hue = new Hue();

hue.setConfig({
	ip: "192.168.11.10",
	key: "9cf5fd0c39b5845d0b8099e9c0daf2cd"
});

module.exports['turnOffLamp1'] = function(test) {
	test.deepEqual(hue.turnOff(1), test_constants.state_off);
	test.done();
};

module.exports['turnOnLamp1'] = function(test) {
	test.deepEqual(hue.turnOn(1), test_constants.state_on);
	test.done();
};

module.exports['turnOffAll'] = function(test) {
	test.deepEqual(hue.turnOffAll(), test_constants.state_off);
	test.done();
};

module.exports['turnOnAll'] = function(test) {
	test.deepEqual(hue.turnOnAll(), test_constants.state_on);
	test.done();
};