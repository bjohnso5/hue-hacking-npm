import test from 'ava';
import {
  clampToRange,
  HueUPNPResponse,
  RGB,
  XYPoint,
} from './hue-interfaces.js';

const rgb: RGB = new RGB(...[1, 2, 256]);
const coords: XYPoint = new XYPoint(...[0.1, 0.2]);

test('RGB constructor', (t) => {
  t.is(rgb.r, 1);
  t.is(rgb.g, 2);
  t.is(rgb.b, 255);
});

test('RGB toString', (t) => {
  t.deepEqual(rgb.toString(), 'r: 1, g: 2, b: 255');
});

test('RGB toCssString', (t) => {
  t.deepEqual(rgb.toCssString(), 'rgb(1, 2, 255)');
});

test('XYPoint constructor', (t) => {
  t.is(coords.x, 0.1);
  t.is(coords.y, 0.2);
});

test('XYPoint toString', (t) => {
  t.deepEqual(coords.toString(), '{x: 0.1, y: 0.2}');
});

test('HueUPNPResponse constructor', (t) => {
  const ok = new HueUPNPResponse({
    id: '1234',
    internalipaddress: '192.168.x.x',
  });
  t.is(ok.id, '1234');
  t.is(ok.internalipaddress, '192.168.x.x');

  const empty = new HueUPNPResponse({ thing1: 'narp', thing2: 'pfft' });
  t.falsy(empty.id);
  t.falsy(empty.internalipaddress);

  const nullResponse = new HueUPNPResponse(null);
  t.is(nullResponse.id, undefined);
  t.is(nullResponse.internalipaddress, undefined);
});

test('clampToRange', (t) => {
  const min = 0;
  const max = 255;
  t.is(clampToRange(min, max, 254), 254);
  t.is(clampToRange(min, max, 256), max);
  t.is(clampToRange(min, max, -15), min);
});
