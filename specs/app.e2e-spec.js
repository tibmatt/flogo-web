'use strict';

const HOST = process.env.FLOGO_HOST || 'localhost';
const PORT = process.env.FLOGO_PORT || '3303';

const MS_WAIT_FOR_ANIMATION = 500;
const ROOT_DIAGRAM_ID = 'root';

var homepage = require('./pages/home.page');
var flowPage = require('./pages/flow.page');
var loadingIndicator = require('./pages/loading-indicator');
var helpers = require('./helpers');

describe('flogo web', function () {
  var flowName = 'My test flow' + (new Date().getTime() / 1000);

  beforeAll(function() {
    browser.get(`http://${HOST}:${PORT}`);
    browser.executeScript('localStorage.setItem("flogo-show-instructions","true");');
  });


  it('should create a flow', function () {
    browser.get(`http://${HOST}:${PORT}`);
    loadingIndicator.wait();

    homepage.addFlowButton.click();

    browser.wait(protractor.ExpectedConditions.presenceOf(homepage.newFlow.name.get()));
    helpers.setValueOnInputElement(homepage.newFlow.name.get(), flowName);

    var flowList = homepage.flowList().get();
    var initialFlowCount = flowList.count();

    homepage.newFlow.clickSave();

    //browser.ignoreSynchronization = true;

    initialFlowCount.then(initialCount => expect(homepage.flowList().get().count()).toEqual(initialCount + 1));

    var flow = flowList.getFlow(0);
    expect(flow.getName()).toEqual(flowName);

    browser.sleep(6000);
    flow.click();
    let flowTitle = flowPage.flowTitle.get();
    browser.wait(protractor.ExpectedConditions.presenceOf(flowTitle));
    expect(flowTitle.getText()).toEqual(flowName);

  }, 60000);

  it('should add a trigger to a flow', function () {
    browser.ignoreSynchronization = true;

    flowPage.newTrigger.openPanel();
    flowPage.newTrigger.selectByName('Receive HTTP Message').click();
    flowPage.tasks.getOfType(['node', 'node_root'], ROOT_DIAGRAM_ID);

    let triggerNodes = flowPage.tasks.getOfType(['node_root'], ROOT_DIAGRAM_ID);
    expect(triggerNodes.count()).toEqual(1);
    expect(flowPage.tasks.getTitles(triggerNodes)).toEqual(['Receive HTTP Message']);

  });

  it('should add an activity to a flow', function () {
    browser.ignoreSynchronization = true;

    let activityTitle = 'log start';
    flowPage.newActivity.openPanel();
    flowPage.newActivity.selectByName('Log Message').click();
    browser.sleep(MS_WAIT_FOR_ANIMATION);
    flowPage.activityPanel.title.replaceText(activityTitle);
    helpers.setValueOnInputElement(flowPage.activityPanel.textInput('message'), 'Start logging...');
    flowPage.activityPanel.booleanInput('flowInfo', true).click();
    flowPage.activityPanel.booleanInput('addToFlow', true).click();

    let saveButton = flowPage.activityPanel.saveButton.get();
    expect(saveButton.isDisplayed()).toBe(true);
    expect(saveButton.isEnabled()).toBe(true);

    flowPage.activityPanel.saveButton.get().click();

    let activityNodes = flowPage.tasks.getOfType(['node'], ROOT_DIAGRAM_ID);
    expect(activityNodes.count()).toEqual(1);
    expect(flowPage.tasks.getTitles(activityNodes, ROOT_DIAGRAM_ID)).toEqual([activityTitle]);

  }, 70000);

  it('should activities to a flow', function () {
    browser.ignoreSynchronization = true;

    flowPage.newActivity.openPanel();

    flowPage.newActivity.selectByName('Invoke REST Service').click();
    browser.sleep(MS_WAIT_FOR_ANIMATION);
    flowPage.activityPanel.title.replaceText('pet query');
    flowPage.activityPanel.selectOption('method', 'GET').click();
    //helpers.setValueOnInputElement(flowPage.activityPanel.textInput('method'), 'GET');
    helpers.setValueOnInputElement(flowPage.activityPanel.textInput('uri'), 'http://petstore.swagger.io/v2/pet/:petId');
    helpers.setValueOnInputElement(flowPage.activityPanel.textArea('pathParams'), '{"petId":"222"}');
    flowPage.activityPanel.saveButton.get().click();

    flowPage.newActivity.openPanel();
    flowPage.newActivity.selectByName('Log Message').click();
    browser.sleep(MS_WAIT_FOR_ANIMATION);
    flowPage.activityPanel.title.replaceText('log pet');
    flowPage.activityPanel.booleanInput('flowInfo', true).click();
    flowPage.activityPanel.booleanInput('addToFlow', true).click();

    flowPage.activityPanel.saveButton.get().isDisplayed()
      .then(isDisplayed => isDisplayed ? flowPage.activityPanel.saveButton.get().click() : null);

    let taskNodes = flowPage.tasks.getOfType(['node', 'node_root'], ROOT_DIAGRAM_ID);
    expect(flowPage.tasks.getOfType(['node', 'node_root'], ROOT_DIAGRAM_ID).count()).toEqual(4);
    expect(flowPage.tasks.getTitles(flowPage.tasks.getOfType(['node', 'node_root'], ROOT_DIAGRAM_ID))).toEqual(['Receive HTTP Message', 'log start', 'pet query', 'log pet']);

  }, 80000);

  it('should allow to add transformation specification', function () {
    browser.ignoreSynchronization = true;

    flowPage.transform.open(flowPage.tasks.findOne('log pet'));
    let transform = flowPage.transform.get(ROOT_DIAGRAM_ID);
    transform.waitVisible();

    let outputField = transform.outputFieldFor('message');
    expect(outputField.isPresent()).toBeTruthy();
    helpers.setValueOnInputElement(outputField, 'pet-query.result.name');

    expect(transform.saveButton.get().isEnabled()).toBeTruthy();
    transform.saveButton.get().click();

    expect(transform.tileHasTransformBadge(flowPage.tasks.findOne('log pet', ROOT_DIAGRAM_ID))).toBeTruthy();

  },80000);

  it('should run succesfully from trigger', function () {
    browser.ignoreSynchronization = true;

    flowPage.tasks.getOfType(['node_root'], ROOT_DIAGRAM_ID).first().click();
    browser.sleep(MS_WAIT_FOR_ANIMATION);

    let runFromTriggerButton = flowPage.activityPanel.runFromTriggerButton.get();
    expect(runFromTriggerButton.isEnabled()).toBeTruthy();

    expect(flowPage.notification.getAll().count()).toEqual(0);
    let allTiles = flowPage.tasks.getOfType(['node_root', 'node'], ROOT_DIAGRAM_ID);
    expect(allTiles.filter(flowPage.tasks.isRan).count()).toBe(0);

    runFromTriggerButton.click();

    let successNotification = flowPage.notification.getSuccess();
    browser.wait(protractor.ExpectedConditions.presenceOf(successNotification));
    //expect(flowPage.notification.getSuccess().getText().then(text => {console.log('message', text); return text;})).toMatch(/Flow completed/i);

    flowPage.tasks.getOfType(['node_root', 'node'], ROOT_DIAGRAM_ID).count()
      .then(totalCount => { expect(
          flowPage.tasks.getOfType(['node_root', 'node'], ROOT_DIAGRAM_ID)
            .filter(flowPage.tasks.isRan).count()
        ).toEqual(totalCount);
      });


  },80000)


});
