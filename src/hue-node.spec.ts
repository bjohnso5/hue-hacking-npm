import { Hue } from '../index';
import { HueBridgeStateChangeResponse, HueBridgeGroupActionResponse, UpdateConfirmation } from './hue-interfaces';
import { AxiosResponse } from 'axios';
import test from 'ava';
import * as TestConstants from './hue-test-constants';

const moxios = require('moxios');

const ip = 'localhost';
const key = 'testapp';
const baseURL = `http://${ip}/api/${key}`;

let hue: Hue = null;

function lightStatePath(index: number): string {
	return `${baseURL}/lights/${index}/state`;
}

function groupActionPath(index: number): string {
	return `${baseURL}/groups/${index}/action`;
}

function successfulPut(responsePayload: any): any {
	return successfulRequest("PUT", responsePayload);
}

function successfulGet(responsePayload: any): any {
	return successfulRequest("GET", responsePayload);
}

function successfulRequest(requestMethod: string, responsePayload: any): any {
	return {
		status: 200,
		method: requestMethod,
		response: responsePayload
	};
}

test.serial('init with retrieval', async t => {

	hue = new Hue({
		ip: ip,
		key: key,
		retrieveInitialState: true
	});

	moxios.install(hue.getHttp());
	
	moxios.stubRequest(`${baseURL}/lights/1`, {
		status: 200,
		response: {
			state: {
				bri: TestConstants.full_brightness
			}
		}
	});

	moxios.stubRequest(`${baseURL}/lights/2`, {
		status: 200,
		response: {
			state: {
				bri: TestConstants.full_brightness
			}
		}
	});

	moxios.stubRequest(`${baseURL}/lights/3`, {
		status: 200,
		response: {
			state: {
				bri: TestConstants.no_brightness
			}
		}
	});
	
	await hue.init();

	moxios.uninstall(hue.getHttp());

	t.pass();
});

test.serial.beforeEach(async t => {
	hue = new Hue({
		ip: ip,
		key: key,
		retrieveInitialState: false
	});
	
	moxios.install(hue.getHttp());
	moxios.install(Hue.getHttp());
	await hue.init();
});

test.serial.afterEach(t => {
	moxios.uninstall(hue.getHttp());
	moxios.uninstall(Hue.getHttp());
});

test.serial('init with retrieval', async t => {

	hue = new Hue({
		ip: ip,
		key: key,
		retrieveInitialState: true
	});

	moxios.install(hue.getHttp());
	
	moxios.stubRequest(`${baseURL}/lights/1`, {
		status: 200,
		response: {
			state: {
				bri: TestConstants.full_brightness
			}
		}
	});

	moxios.stubRequest(`${baseURL}/lights/2`, {
		status: 200,
		response: {
			state: {
				bri: TestConstants.full_brightness
			}
		}
	});

	moxios.stubRequest(`${baseURL}/lights/3`, {
		status: 200,
		response: {
			state: {
				bri: TestConstants.no_brightness
			}
		}
	});
	
	await hue.init();

	moxios.uninstall(hue.getHttp());

	t.pass();
});

test.serial.beforeEach(async t => {
	hue = new Hue({
		ip: ip,
		key: key,
		retrieveInitialState: false
	});
	
	moxios.install(hue.getHttp());
	moxios.install(Hue.getHttp());
	await hue.init();
});

test.serial.afterEach(t => {
	moxios.uninstall(hue.getHttp());
	moxios.uninstall(Hue.getHttp());
});

test.serial('turnOnLamp1', async t => {

	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		response: [
			{"success": { "/lights/1/state/on": true }}
		]
	});

	const response = await hue.turnOn(1);
	t.deepEqual(response.changedStates[0], TestConstants.state_on(1));

});

test.serial('turnOffLamp1', async t => {

	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		response: [
			{ "success": { "/lights/1/state/on": false } }
		]
	});

	const response = await hue.turnOff(1);
	t.deepEqual(response.changedStates[0], TestConstants.state_off(1));

});

test.serial('turnOffAll', async t =>{

	moxios.stubRequest(`${baseURL}/groups/0/action`, {
		status: 200,
		response: [
			{ "success": { "address": "/groups/0/action/on", "value": false } }
		]
	});

	const response = await hue.turnOffAll();
	t.deepEqual(response.acknowledgedActions[0], TestConstants.group_off(0));

});

test.serial('turnOnAll', async t =>{
	
	moxios.stubRequest(`${baseURL}/groups/0/action`, {
		status: 200,
		response: [
			{ "success": { "address": "/groups/0/action/on", "value": true } }
		]
	});

	const response = await hue.turnOnAll();
	t.deepEqual(response.acknowledgedActions[0], TestConstants.group_on(0));

});

test.serial('setCssColor', async t => {
	
	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		response: [
			{ "success": { "/lights/1/state/xy": TestConstants.color_red } }
		]
	});

	const response = await hue.setColor(1, 'red');
	t.deepEqual(response.changedStates[0], TestConstants.color_red_response);

});

test.serial('setCssColorAll', async t => {
	
	moxios.stubRequest(`${baseURL}/groups/0/action`, {
		status: 200,
		response: TestConstants.color_white_response
	});

	const response = await hue.setAllColors('white');
	t.deepEqual(response, new HueBridgeGroupActionResponse(TestConstants.color_white_response));
});

test.serial('testEmptyConfig', async t => {
	hue = new Hue();
	t.truthy(hue);
});

test.serial('getColors', t => {
	t.truthy(hue.getColors());
});

test.serial('setBrightness', async t => {

	const responsePayload = [{ "success": { "/lights/1/state/bri": 231 } }];

	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		method: 'PUT',
		response: responsePayload
	});

	const setBriResponse = await hue.setBrightness(1, 231);
	t.deepEqual(setBriResponse, new HueBridgeStateChangeResponse(responsePayload));

	moxios.stubRequest(`${baseURL}/lights/1`, {
		status: 200,
		method: 'GET',
		response: { "state": { "bri": 231 } }
	});

	const getBriResponse = await hue.getBrightness(1);
	t.deepEqual(getBriResponse, 231);
});

test.serial('search', async t => {

	const nupnpResponse = [{"id":"785d973935391ad0","internalipaddress":"192.168.x.x"}];

	moxios.stubRequest(`https://www.meethue.com/api/nupnp`, {
		status: 200,
		method: 'GET',
		response: nupnpResponse
	});

	const foundIp = await Hue.search();
	t.is('192.168.x.x', foundIp);

});

test.serial('setColorTemperature', async t => {

	const responsePayload: any = [
		{ success: { "/lights/1/state/ct": 124 } }
	];

	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		method: 'PUT',
		response: responsePayload
	});

	const setCTResponse = await hue.setColorTemperature(1, 4000);
	t.deepEqual(setCTResponse, new HueBridgeStateChangeResponse(responsePayload));

});

test.serial('brighten', async t => {
	const responsePayload: any = [
		{ success: { "lights/1/state/bri": 254 } }
	];

	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		method: 'PUT',
		response: responsePayload
	});

	const brightenResponse = await hue.brighten(1, 10);
	t.deepEqual(brightenResponse, new HueBridgeStateChangeResponse(responsePayload));
});

test.serial('brightenAll', async t => {
	const responsePayload: UpdateConfirmation[] = [
		{ success: { address: "groups/0/action/bri_inc", value: 10 } }
	];

	moxios.stubRequest(groupActionPath(0), successfulPut(responsePayload));

	const groupFlashResponse = await hue.brightenAll(10);
	t.deepEqual(groupFlashResponse, new HueBridgeGroupActionResponse(responsePayload));
});

test.serial('dim', async t => {
	const responsePayload: any = [
		{ success: { "lights/1/state/bri_inc": -10 } }
	];

	moxios.stubRequest(lightStatePath(1), successfulPut(responsePayload));

	const dimResponse = await hue.dim(1, 10);
	t.deepEqual(dimResponse, new HueBridgeStateChangeResponse(responsePayload));
});

test.serial('dimAll', async t => {
	const responsePayload: UpdateConfirmation[] = [
		{ success: { address: "groups/0/action/bri_inc", value: -10 } }
	];

	moxios.stubRequest(groupActionPath(0), successfulPut(responsePayload));

	const groupFlashResponse = await hue.dimAll(10);
	t.deepEqual(groupFlashResponse, new HueBridgeGroupActionResponse(responsePayload));
});

test.serial('flash', async t => {
	const responsePayload = [
		{ success: { "lights/1/state/alert": "select" } }
	];

	moxios.stubRequest(lightStatePath(1), successfulPut(responsePayload));

	const flashResponse = await hue.flash(1);
	t.deepEqual(flashResponse, new HueBridgeStateChangeResponse(responsePayload));
});

test.serial('flashAll', async t => {
	const responsePayload: UpdateConfirmation[] = [
		{ success: { address: "groups/0/action/alert", value: "select" } }
	];

	moxios.stubRequest(groupActionPath(0), successfulPut(responsePayload));

	const groupFlashResponse = await hue.flashAll();
	t.deepEqual(groupFlashResponse, new HueBridgeGroupActionResponse(responsePayload));
});

test.serial('setNumberOfLamps', t => {
	let config = hue.getConfig();
	const defaultNumLamps = config.numberOfLamps;

	t.is(defaultNumLamps, 3);

	hue.setnumberOfLamps(2);
	const updatedNumLamps = config.numberOfLamps;

	t.is(updatedNumLamps, 2);
});

test.serial('setTransitionTime', t => {
	let config = hue.getConfig();
	const defaultTransitionTime = config.transitionTime;

	t.is(defaultTransitionTime, 400);

	hue.setTransitionTime(150);
	const updatedTransitionTime = config.transitionTime;

	t.is(updatedTransitionTime, 150);
});