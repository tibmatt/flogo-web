exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['specs/app.e2e-spec.js'],
  useAllAngular2AppRoots: true
};
