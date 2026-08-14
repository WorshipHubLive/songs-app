const jestExpoPreset = require('jest-expo/jest-preset');
const { resolveBabelOptions } = require('jest-expo/src/resolveBabelOptions');

// jest-expo's own preset only runs babel-jest over `.js/.jsx/.ts/.tsx` —
// several RN packages (lucide-react-native, @expo/material-symbols) ship
// an ESM `.mjs` build that Metro picks via the "react-native"/"import"
// package.json export condition, but Jest's CJS module loader can't
// parse raw `export`/`import` syntax without also transforming that
// extension. Reusing the exact same babel options the preset resolves
// for `.tsx?` keeps this in sync with the project's real Metro/Babel
// config instead of hand-rolling a second one.
const babelOptions = resolveBabelOptions(__dirname);

/** @type {import('jest').Config} */
module.exports = {
  ...jestExpoPreset,
  transform: {
    ...jestExpoPreset.transform,
    '\\.mjs$': ['babel-jest', babelOptions],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native|@expo/material-symbols)',
  ],
  collectCoverageFrom: ['lib/**/*.{ts,tsx}', 'db/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/', '/.maestro/'],
};
