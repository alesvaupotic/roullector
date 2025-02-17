import { resolve } from 'path';

import {
  vol,
  fs as memfs,
} from 'memfs';

import { collect } from '$commands/collect/collect';
import {
  defaultCollectOptions,
  MAPPING_FILENAME,
} from '$commands/collect/collect.constants';
import * as jsonModule from '$commands/collect/generators/json/json';
import * as routeModule from '$commands/collect/generators/route/route';
import { FILES } from '$tests/fixtures/memfs';

jest.mock('fs', () => {
  const fs = jest.requireActual('fs');
  const sourcePath = './generators/route/route.source.ts';
  const sourceOfRouteUtil = fs.readFileSync(resolve(__dirname, sourcePath), 'utf-8');
  vol.fromJSON({
    ['./generators/route.source.ts']: sourceOfRouteUtil,
  }, __dirname);

  return memfs;
});

const savedJSON = vol.toJSON();
beforeEach(() => {
  vol.fromNestedJSON(FILES, defaultCollectOptions.inDir);
  vol.fromJSON(savedJSON, __dirname);
});
afterEach(() => {
  vol.reset();
});

test('collect: default', () => {
  const { json, route } = collect(defaultCollectOptions);
  const { outDir } = defaultCollectOptions;
  expect(json).toBe(resolve(outDir, MAPPING_FILENAME));
  expect(memfs.existsSync(json)).toBe(true);
  expect(route.startsWith(resolve(outDir, 'index'))).toBe(true);
  expect(memfs.existsSync(route)).toBe(true);
});

test('collect: failure in generateJSON', () => {
  const spyError = jest.spyOn(console, 'error').mockImplementation();
  const errorMessage = 'Something went wrong in generateJSON';
  const spyGenerateJSON = jest.spyOn(jsonModule, 'generateJSON').mockImplementationOnce(() => {
    throw new Error(errorMessage);
  });
  expect(() => {
    collect(defaultCollectOptions);
  }).toThrow(errorMessage);
  expect(spyGenerateJSON).toHaveBeenCalled();
  expect(spyError).toHaveBeenCalled();
});

test('collect: failure in generateRouteUtil', () => {
  const spyError = jest.spyOn(console, 'error').mockImplementation();
  const errorMessage = 'Something went wrong in generateRouteUtil';
  const spyGenerateJSON = jest.spyOn(routeModule, 'generateRouteUtil').mockImplementationOnce(() => {
    throw new Error(errorMessage);
  });
  expect(() => {
    collect(defaultCollectOptions);
  }).toThrow(errorMessage);
  expect(spyGenerateJSON).toHaveBeenCalled();
  expect(spyError).toHaveBeenCalled();
});
