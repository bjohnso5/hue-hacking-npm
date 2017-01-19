import { Hue } from '../index';
import { XYPoint } from '../src/hue-interfaces';
import test from 'ava';

let hue = new Hue();
let colors = hue.getColors();

const hexRGBRed = 'ff6c22';
const cieRGBRed: XYPoint = { x: 0.6484272236872118, y: 0.330856101472778 };
const hexRGBGreen = 'fffe50';
const cieRGBGreen: XYPoint = { x: 0.4091, y: 0.518 };
const hexRGBBlue = '3639ff';
const cieRGBBlue: XYPoint = { x: 0.167, y: 0.04 };

function closeEnoughForGovernmentWork(actual: XYPoint, expected: XYPoint): boolean {
  const epsilon = 1e-7,
        dX = Math.abs(actual.x - expected.x),
        dY = Math.abs(actual.y - expected.y);

  return dX < epsilon && dY < epsilon;
}

test('known parameter returns known coordinates (full red)', t => {
  t.is(colors.CIE1931ToHex(cieRGBRed), hexRGBRed);
});

test('known parameter returns known coordinates (full green)', t => {
  t.is(colors.CIE1931ToHex(cieRGBGreen), hexRGBGreen);
});

test('known parameter returns known coordinates (full blue with brightness)', t => {
  t.is(colors.CIE1931ToHex(cieRGBBlue, 1), hexRGBBlue);
});

test('getCIEColor full blue', t => {
  t.true(closeEnoughForGovernmentWork(colors.getCIEColor('0000f'), cieRGBBlue));
});
