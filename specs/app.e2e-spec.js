const HOST = process.env.FLOGO_HOST || 'localhost';
const PORT = process.env.FLOGO_PORT || '3010';

const MS_WAIT_FOR_ANIMATION = 500;

var homepage = require('./pages/home.page');
var flowPage = require('./pages/flow.page');

var LoadingIndicator = {
  wait: function(timeout){
    var ignoreSync = browser.ignoreSynchronization;
    browser.ignoreSynchronization = true;
    var spinner = element(by.css('.flogo-spin-loading'));
    return browser
      .wait(protractor.ExpectedConditions.stalenessOf(spinner), timeout || 3000)
      .then(() => browser.ignoreSynchronization = ignoreSync);
  }
};

describe('flogo web', function() {
  var flowName = 'My new shiny flow';

  it('should create a flow', function() {
    browser.get(`http://${HOST}:${PORT}`);
    LoadingIndicator.wait();

    homepage.addFlowButton.click();

    setValueOnInputElement(homepage.newFlow.name.get(), flowName);

    var flowList = homepage.flowList().get();
    var initialFlowCount = flowList.count();

    homepage.newFlow.clickSave();

    initialFlowCount.then(initialCount => expect(flowList.count()).toEqual(initialCount + 1));

    var flow = flowList.getFlow(0);
    expect(flow.getName()).toEqual(flowName);

    flow.click();

    browser.ignoreSynchronization = true;
    let flowTitle = flowPage.flowTitle.get();
    browser.wait(protractor.ExpectedConditions.presenceOf(flowTitle));
    expect(flowTitle.getText()).toEqual(flowName);

  }, 60000);

  it('should add a trigger to a flow', function() {
    browser.ignoreSynchronization = true;

    flowPage.newTrigger.openPanel();
    flowPage.newTrigger.selectByName('REST Trigger').click();
    flowPage.tasks.getOfType(['node', 'node_root']);

    let triggerNodes = flowPage.tasks.getOfType(['node_root']);
    expect(triggerNodes.count()).toEqual(1);
    expect(flowPage.tasks.getTitles(triggerNodes)).toEqual(['REST Trigger']);

  });

  it('should add an activity to a flow', function() {
    browser.ignoreSynchronization = true;

    let activityTitle = 'log start';
    flowPage.newActivity.openPanel();
    flowPage.newActivity.selectByName('Log Activity').click();
    browser.sleep(MS_WAIT_FOR_ANIMATION);
    flowPage.activityPanel.title.replaceText(activityTitle);
    setValueOnInputElement(flowPage.activityPanel.textInput('message'), 'Start logging...');
    flowPage.activityPanel.booleanInput('flowInfo', true).click();
    flowPage.activityPanel.booleanInput('addToFlow', true).click();

    let saveButton = flowPage.activityPanel.saveButton.get();
    expect(saveButton.isDisplayed()).toBe(true);
    expect(saveButton.isEnabled()).toBe(true);

    flowPage.activityPanel.saveButton.get().click();

    let activityNodes = flowPage.tasks.getOfType(['node']);
    expect(activityNodes.count()).toEqual(1);
    expect(flowPage.tasks.getTitles(activityNodes)).toEqual([activityTitle]);

  }, 70000);

  it('should activities to a flow', function() {
    browser.ignoreSynchronization = true;

    flowPage.newActivity.openPanel();
    flowPage.newActivity.selectByName('REST Activity').click();
    browser.sleep(MS_WAIT_FOR_ANIMATION);
    flowPage.activityPanel.title.replaceText('pet query');
    setValueOnInputElement(flowPage.activityPanel.textInput('method'), 'GET');
    setValueOnInputElement(flowPage.activityPanel.textInput('uri'), 'http://petstore.swagger.io/v2/pet/:petId');
    setValueOnInputElement(flowPage.activityPanel.textArea('pathParams'), '{"petId":"222"}');
    flowPage.activityPanel.saveButton.get().click();

    flowPage.newActivity.openPanel();
    flowPage.newActivity.selectByName('Log Activity').click();
    browser.sleep(MS_WAIT_FOR_ANIMATION);
    flowPage.activityPanel.title.replaceText('log pet');
    flowPage.activityPanel.booleanInput('flowInfo', true).click();
    flowPage.activityPanel.booleanInput('addToFlow', true).click();

    flowPage.activityPanel.saveButton.get().isDisplayed()
      .then(isDisplayed => isDisplayed ? flowPage.activityPanel.saveButton.get().click() : null);

    let taskNodes = flowPage.tasks.getOfType(['node', 'node_root']);
    expect(taskNodes.count()).toEqual(4);
    expect(flowPage.tasks.getTitles(taskNodes)).toEqual(['REST Trigger', 'log start', 'pet query', 'log pet']);

  }, 70000);


});

// chrome driver bug
function setValueOnInputElement(inputElement, value) {
  inputElement.clear();
  inputElement.sendKeys(value);
  inputElement.getAttribute('value').then(insertedValue => {
    if (insertedValue !== value) {
      // Failed, must send characters one at a time
      inputElement.clear();
      var i;
      for(i = 0; i < value.length; i++){
        inputElement.sendKeys(value.charAt(i));
      }
    }
  });
}

