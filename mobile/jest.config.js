const path = require('path');

module.exports = {
  preset: 'jest-expo',
  // rootDir defaults to current directory (mobile)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@vigilante/shared)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^@vigilante/shared$': '<rootDir>/../packages/shared/src/index.ts',
    '^@/(.*)$': '<rootDir>/$1'
  }
};
