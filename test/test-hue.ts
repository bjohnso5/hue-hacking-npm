import { Hue } from '../index';
import { ICallbackFunction, Test } from '@types/nodeunit';
import * as TestConstants from './hue-test-constants';

let moxios = require('moxios');

const ip = 'localhost';
const key = 'testapp';
const baseURL = `http://${ip}/api/${key}`;

let hue = new Hue({
	ip: "localhost",
	key: "testapp"
});

module.exports = {

	setUp: function(callback: ICallbackFunction): void {
		moxios.install(hue.getHttp());
		callback();
	},

	tearDown: function(callback: ICallbackFunction): void {
		moxios.uninstall(hue.getHttp());
		callback();
	},

	"getDefaultBrightness": function(test: Test): void {
		test.deepEqual(254, hue.getCurrentBrightness(0));
		test.done();
	},

	"turnOnLamp1": function(test: Test): void {

		moxios.stubRequest(`${baseURL}/lights/1/state`, {
			status: 200,
			response: TestConstants.state_on
		});

		hue.turnOn(1).then(response => {
			test.deepEqual(response.data, TestConstants.state_on);
			test.done();
		}).catch(error => {
			test.done(error);
		});
	},

	"turnOffLamp1": function(test: Test): void {
		
		moxios.stubRequest(`${baseURL}/lights/1/state`, {
			status: 200,
			response: TestConstants.state_off
		});

		hue.turnOff(1).then(response => {
			test.deepEqual(response.data, TestConstants.state_off);
			test.done();
		}).catch(error => {
			test.done(error);
		});
	},

	"turnOffAll": function(test: Test): void {
		
		moxios.stubRequest(`${baseURL}/groups/0/action`, {
			status: 200,
			response: TestConstants.state_off
		});

		hue.turnOffAll().then(response => {
			test.deepEqual(response.data, TestConstants.state_off);
			test.done();
		}).catch(error => {
			test.done(error);
		});
	},

	"turnOnAll": function(test: Test): void {
		
		moxios.stubRequest(`${baseURL}/groups/0/action`, {
			status: 200,
			response: TestConstants.state_on
		});

		hue.turnOnAll().then(response => {
			test.deepEqual(response.data, TestConstants.state_on);
			test.done();
		}).catch(error => {
			test.done(error);
		});
	},

	"testSetCssColor": function(test: Test): void {

		moxios.stubRequest(`${baseURL}/lights/1/state`, {
			status: 200,
			response: TestConstants.color_red
		});

		hue.setColor(1, 'red').then(response => {
			test.deepEqual(response.data, TestConstants.color_red);
			test.done();
		}).catch(error => {
			test.done(error);
		});

	},

	"testSetCssColorAll": function(test: Test): void {

		moxios.stubRequest(`${baseURL}/groups/0/action`, {
			status: 200,
			response: TestConstants.color_white
		});

		hue.setAllColors('white').then(response => {
			test.deepEqual(response.data, TestConstants.color_white);
			test.done();
		}).catch(error => {
			test.done(error);
		});

	}

};
