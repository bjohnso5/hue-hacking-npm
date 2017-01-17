"use strict";
const index_1 = require("../index");
const TestConstants = require("./hue-test-constants");
let moxios = require('moxios');
const ip = 'localhost';
const key = 'testapp';
const baseURL = `http://${ip}/api/${key}`;
let hue = new index_1.Hue({
    ip: "localhost",
    key: "testapp"
});
module.exports = {
    setUp: function (callback) {
        moxios.install(hue.getHttp());
        callback();
    },
    tearDown: function (callback) {
        moxios.uninstall(hue.getHttp());
        callback();
    },
    "getDefaultBrightness": function (test) {
        test.deepEqual(254, hue.getCurrentBrightness(0));
        test.done();
    },
    "turnOnLamp1": function (test) {
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
    "turnOffLamp1": function (test) {
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
    "turnOffAll": function (test) {
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
    "turnOnAll": function (test) {
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
    "testSetCssColor": function (test) {
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
    "testSetCssColorAll": function (test) {
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
