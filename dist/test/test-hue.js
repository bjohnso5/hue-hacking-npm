"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const index_1 = require("../index");
const ava_1 = require("ava");
const TestConstants = require("./hue-test-constants");
let moxios = require('moxios');
const ip = 'localhost';
const key = 'testapp';
const baseURL = `http://${ip}/api/${key}`;
let hue = new index_1.Hue({
    ip: "localhost",
    key: "testapp"
});
ava_1.default.beforeEach(t => {
    moxios.install(hue.getHttp());
});
ava_1.default.afterEach(t => {
    moxios.uninstall(hue.getHttp());
});
ava_1.default('getDefaultBrightness', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(hue.getCurrentBrightness(0), 254);
}));
ava_1.default.serial('turnOnLamp1', (t) => __awaiter(this, void 0, void 0, function* () {
    moxios.stubRequest(`${baseURL}/lights/1/state`, {
        status: 200,
        response: TestConstants.state_on
    });
    const response = yield hue.turnOn(1);
    t.is(response.data, TestConstants.state_on);
}));
ava_1.default.serial('turnOffLamp1', (t) => __awaiter(this, void 0, void 0, function* () {
    moxios.stubRequest(`${baseURL}/lights/1/state`, {
        status: 200,
        response: TestConstants.state_off
    });
    const response = yield hue.turnOff(1);
    t.is(response.data, TestConstants.state_off);
}));
ava_1.default.serial('turnOffAll', (t) => __awaiter(this, void 0, void 0, function* () {
    moxios.stubRequest(`${baseURL}/groups/0/action`, {
        status: 200,
        response: TestConstants.state_off
    });
    const response = yield hue.turnOffAll();
    t.is(response.data, TestConstants.state_off);
}));
ava_1.default.serial('turnOnAll', (t) => __awaiter(this, void 0, void 0, function* () {
    moxios.stubRequest(`${baseURL}/groups/0/action`, {
        status: 200,
        response: TestConstants.state_on
    });
    const response = yield hue.turnOnAll();
    t.is(response.data, TestConstants.state_on);
}));
ava_1.default.serial('setCssColor', (t) => __awaiter(this, void 0, void 0, function* () {
    moxios.stubRequest(`${baseURL}/lights/1/state`, {
        status: 200,
        response: TestConstants.color_red
    });
    const response = yield hue.setColor(1, 'red');
    t.is(response.data, TestConstants.color_red);
}));
ava_1.default.serial('setCssColorAll', (t) => __awaiter(this, void 0, void 0, function* () {
    moxios.stubRequest(`${baseURL}/groups/0/action`, {
        status: 200,
        response: TestConstants.color_white
    });
    const response = yield hue.setAllColors('white');
    t.is(response.data, TestConstants.color_white);
}));
