'use strict';

module.exports = {
  wait: function(timeout){
    var ignoreSync = browser.ignoreSynchronization;
    browser.ignoreSynchronization = true;
    var spinner = element(by.css('.flogo-spin-loading'));
    return browser
      .wait(protractor.ExpectedConditions.stalenessOf(spinner), timeout || 3000)
      .then(() => browser.ignoreSynchronization = ignoreSync);
  }
};
