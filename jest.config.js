// const jestProjects = ['apps/server', 'libs/parser', 'libs/server'].join(',');
const get = require('lodash/get');
const projectsConfig = require('./angular.json');
const jestProjectRoots = getJestProjectsRoots(projectsConfig).join(',');

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
      tsConfigFile: './tsconfig.spec.json',
    },
    __TRANSFORM_HTML__: true,
  },
  testMatch: [`**/{${jestProjectRoots}}/**/+(*.)+(spec|test).+(ts|js)?(x)`],
  transform: {
    '^.+\\.(ts|js|html)$': 'jest-preset-angular/preprocessor.js',
  },
  resolver: '@nrwl/builders/plugins/jest/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageReporters: ['html'],
  setupTestFrameworkScriptFile: '<rootDir>/jest.setup.ts',
};

function getJestProjectsRoots(projectsConfig) {
  const jestPattern = /jest/;
  const projectUsesJest = p => jestPattern.test(get(p, 'architect.test.builder', ''));
  return Object.values(projectsConfig.projects)
    .filter(projectUsesJest)
    .map(p => p.root.replace(/\/$/, ''));
}
