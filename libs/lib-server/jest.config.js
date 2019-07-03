module.exports = {
  name: 'lib-server',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/lib-server/core',
  // todo: switch for setupFilesAfterEnv after https://github.com/nrwl/nx/issues/1343 is fixed
  setupTestFrameworkScriptFile: '../../jest.setup.ts',
};
