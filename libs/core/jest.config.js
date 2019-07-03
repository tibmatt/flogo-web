module.exports = {
  name: 'core',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/core',
  // todo: switch for setupFilesAfterEnv after https://github.com/nrwl/nx/issues/1343 is fixed
  setupTestFrameworkScriptFile: '../../jest.setup.ts',
};
