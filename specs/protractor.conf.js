exports.config = {
  framework: 'jasmine',
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./app.e2e-spec.js'],
  useAllAngular2AppRoots: true,
  capabilities: {
    'browserName': 'chrome',
    /**
     * Chrome is not allowed to create a SUID sandbox when running inside Docker
     */
    'chromeOptions': {
      'args': ['no-sandbox']
    }
  }
};
