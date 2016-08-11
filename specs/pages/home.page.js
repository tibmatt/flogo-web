'use strict';

var Homepage = {
  addFlowButton: {
    click: function () {
      return element(by.css('flogo-flows-add button')).click();
    }
  },
  newFlow: {
    name: { get: function () { return element(by.css('input#flowName')) }},
    clickSave: function () {
      return element(by.css('.flogo-flows-add-save')).click()
    }
  }
};

Homepage.flowList = function flowList() {

  return {
    get: function () {
      return new FlowList(element.all(by.css('.flogo-flows-container-list-detail')));
    }
  };

  function FlowList(elementList) {
    return {
      element: elementList,
      count: count,
      getFlow: getFlow
    };

    function count() {
      return elementList.count();
    }

    function getFlow(index) {
      return new Homepage.Flow(elementList.get(index));
    }

  }

};

Homepage.Flow = function HomepageFlow(element) {
  return {
    element: element,
    getName: getName,
    click: click
  };

  function click() {
    return element.click();
  }

  function getName() {
    return element.element(by.css('.flogo-flows-container-list-detail-name')).getText();
  }

};

module.exports = Homepage;
