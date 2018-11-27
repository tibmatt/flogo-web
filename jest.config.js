const jestProjects = [
  'apps/server',
  'libs/parser',
].join(',');

// module.exports = {
//   testMatch: [`**/{${jestProjects}}/**/+(*.)+(spec|test).+(ts|js)?(x)`],
//   transform: {
//     '^.+\\.(ts|js|html)$': 'jest-preset-angular/preprocessor.js'
//   },
//   resolver: '@nrwl/builders/plugins/jest/resolver',
//   moduleFileExtensions: ['ts', 'js', 'html'],
//   collectCoverage: true,
//   coverageReporters: ['html']
// };


module.exports = {
  globals: {
    'ts-jest': {
      tsConfigFile: './tsconfig.spec.json'
    },
    __TRANSFORM_HTML__: true
  },
  testMatch: [`**/{${jestProjects}}/**/+(*.)+(spec|test).+(ts|js)?(x)`],
  transform: {
    '^.+\\.(ts|js|html)$': 'jest-preset-angular/preprocessor.js'
  },
  resolver: '@nrwl/builders/plugins/jest/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageReporters: ['html'],
  setupTestFrameworkScriptFile: '<rootDir>/jest.setup.ts'
};
