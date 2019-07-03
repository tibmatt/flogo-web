module.exports = {
  name: 'plugins-flow-server',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/plugins/flow-server',
  // todo: switch for setupFilesAfterEnv after https://github.com/nrwl/nx/issues/1343 is fixed
  setupTestFrameworkScriptFile: '../../../jest.setup.ts',
};
