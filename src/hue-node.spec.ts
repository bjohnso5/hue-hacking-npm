import { Hue } from '../index';
import { AxiosResponse } from 'axios';
import test from 'ava';
import * as TestConstants from './hue-test-constants';

let moxios = require('moxios');

const ip = 'localhost';
const key = 'testapp';
const baseURL = `http://${ip}/api/${key}`;

let hue: Hue = null;

test.beforeEach(async t => {
	hue = new Hue({
		ip: ip,
		key: key,
		retrieveInitialState: false
	});
	
	moxios.install(hue.getHttp());
	await hue.init();
});

test.afterEach(t => {
	moxios.uninstall(hue.getHttp());
});

test.serial('getCurrentBrightness (no initial call)', async t => {

	t.is(hue.getCurrentBrightness(1), 254);
	
});

test.serial('turnOnLamp1', async t => {

	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		response: TestConstants.state_on
	});

	const response = await hue.turnOn(1);
	t.is(response.data, TestConstants.state_on);

});

test.serial('turnOffLamp1', async t => {

	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		response: TestConstants.state_off
	});

	const response = await hue.turnOff(1);
	t.is(response.data, TestConstants.state_off);

});

test.serial('turnOffAll', async t =>{

	moxios.stubRequest(`${baseURL}/groups/0/action`, {
		status: 200,
		response: TestConstants.state_off
	});

	const response = await hue.turnOffAll();
	t.is(response.data, TestConstants.state_off);

});

test.serial('turnOnAll', async t =>{
	
	moxios.stubRequest(`${baseURL}/groups/0/action`, {
		status: 200,
		response: TestConstants.state_on
	});

	const response = await hue.turnOnAll();
	t.is(response.data, TestConstants.state_on);

});

test.serial('setCssColor', async t => {
	
	moxios.stubRequest(`${baseURL}/lights/1/state`, {
		status: 200,
		response: TestConstants.color_red
	});

	const response = await hue.setColor(1, 'red');
	t.is(response.data, TestConstants.color_red);

});

test.serial('setCssColorAll', async t => {
	
	moxios.stubRequest(`${baseURL}/groups/0/action`, {
		status: 200,
		response: TestConstants.color_white
	});

	const response = await hue.setAllColors('white');
	t.is(response.data, TestConstants.color_white);

});


/** Why does this never complete? Investigate use of async / await */
// test.serial('init with retrieval', async t => {
	
// 	hue = new Hue({
// 		ip: ip,
// 		key: key,
// 		retrieveInitialState: true
// 	});

// 	moxios.install(hue.getHttp());
	
// 	moxios.stubRequest('${baseURL}/lights/1', {
// 		status: 200,
// 		response: {
// 			state: {
// 				bri: TestConstants.full_brightness
// 			}
// 		}
// 	});

// 	moxios.stubRequest('${baseURL}/lights/2', {
// 		status: 200,
// 		response: {
// 			state: {
// 				bri: TestConstants.full_brightness
// 			}
// 		}
// 	});

// 	moxios.stubRequest('${baseURL}/lights/3', {
// 		status: 200,
// 		response: {
// 			state: {
// 				bri: TestConstants.no_brightness
// 			}
// 		}
// 	});
	
// 	await hue.init();

// 	t.is(hue.getCurrentBrightness(1), TestConstants.full_brightness);
// 	t.is(hue.getCurrentBrightness(2), TestConstants.full_brightness);
// 	t.is(hue.getCurrentBrightness(3), TestConstants.no_brightness);
// });
