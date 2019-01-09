const projectsConfig = require('./angular.json');
const jestProjectRoots = getJestProjectsRoots(projectsConfig).join(',');

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
  const projectUsesJest = project => {
    const testConfig = (project.architect || {}).test || {};
    return testConfig.builder && jestPattern.test(testConfig.builder);
  };
  return Object.values(projectsConfig.projects)
    .filter(projectUsesJest)
    .map(p => p.root.replace(/\/$/, ''));
}
