module.exports = {
  name: 'server',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/server',
  // todo: switch for setupFilesAfterEnv after https://github.com/nrwl/nx/issues/1343 is fixed
  setupTestFrameworkScriptFile: '../../jest.setup.ts',
  testEnvironment: 'node',
};
