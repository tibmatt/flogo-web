'use strict';

const TRANSFORM_MENU_TYPE = 1;

module.exports = {
  open(taskElement) {
    return browser.actions()
      .mouseMove(taskElement)
      .perform()
      // wait for animation to complete
      .then(() => browser.sleep(250))
      .then(() => {
        let menuTab = taskElement.element(by.css('.flogo-flows-detail-diagram-node-menu-gear'));
        return menuTab.getSize()
          .then(size => {
            return browser.actions()
              // need to hover from the right to make sure we're targeting the menu tab and not the task node
              .mouseMove(menuTab, {x: size.width - 1, y: size.height / 2})
              .perform()
          });
      })
      // wait for animation to complete
      .then(() => browser.sleep(250))
      .then(() => {
        return taskElement
          .element(by.css(`.flogo-flows-detail-diagram-node-menu-list[data-menu-item-type="${TRANSFORM_MENU_TYPE}"]`))
          .click();
      })
  },
  /**
   *
   * @returns {TransformFragment}
   */
  get: function() {
    let elem = element(by.css('flogo-transform'));
    return new TransformFragment(elem);
  }
};

function TransformFragment(fragment) {

  return {
    outputFieldFor: function outputFieldFor(inputPropName) {
      return fragment
        .all(by.css('.flogo-visual-mapper__item'))
        .filter(item => item
          .element(by.css('.flogo-visual-mapper__item__input'))
          .getText(propName => propName == inputPropName))
        .first()
        .element(by.css('.flogo-visual-mapper__item__output__text'));
    },
    waitVisible: function waitVisible() {
      return browser.wait(protractor.ExpectedConditions.visibilityOf(fragment));
    },
    tileHasTransformBadge(tileElement) {
      return tileElement
        .element(by.css('.flogo-flows-detail-diagram-node-badge'))
        .element(by.css('.flogo-flows-detail-diagram-ic-transform'))
        .isPresent();
    },
    saveButton: {
      get() {
        return fragment
          .element(by.css('.flogo-transform-header__main-actions'))
          .element(by.css('.tc-buttons-primary'));
      }
    }
  };



}
