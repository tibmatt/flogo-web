module.exports = {
  name: 'plugins-stream-server',
  preset: '../../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../coverage/libs/plugins/stream-server',
  // todo: switch for setupFilesAfterEnv after https://github.com/nrwl/nx/issues/1343 is fixed
  setupTestFrameworkScriptFile: '../../../jest.setup.ts',
};
