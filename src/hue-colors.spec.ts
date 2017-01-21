import { HueColors, hexFullBlue, hexFullWhite } from './hue-colors';
import { XYPoint } from '../src/hue-interfaces';
import test from 'ava';

const colors = new HueColors();

const hexRGBRed = 'ff6c22';
const cieRGBRed: XYPoint = { x: 0.6484272236872118, y: 0.330856101472778 };
const hexRGBGreen = 'fffe50';
const cieRGBGreen: XYPoint = { x: 0.4091, y: 0.518 };
const hexRGBBlue = '3639ff';
const cieRGBBlue: XYPoint = { x: 0.167, y: 0.04 };
const cieRGBWhite: XYPoint = { x: 0.3, y: 0.3 };
const coordinateEpsilon: number = 1e-1; // fairly loose definition of equality

function closeEnoughForGovernmentWork(actual: XYPoint, expected: XYPoint): boolean {
  const dX = Math.abs(actual.x - expected.x),
        dY = Math.abs(actual.y - expected.y);

  return dX < coordinateEpsilon && dY < coordinateEpsilon;
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
  t.true(closeEnoughForGovernmentWork(colors.getCIEColor(hexFullBlue), cieRGBBlue));
  t.true(closeEnoughForGovernmentWork(colors.getCIEColor('0000f'), cieRGBBlue));
});

test('getCIEColor white', t => {
  t.true(closeEnoughForGovernmentWork(colors.getCIEColor(hexFullWhite), cieRGBWhite));
});

test('getCIEColor random values', t => {
  t.truthy(colors.getCIEColor());
});
