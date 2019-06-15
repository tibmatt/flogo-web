export const testId = tId => `[data-testid="${tId}"]`;

export const shouldBeInViewport = viewportCheck('in viewport', (bottom, rect) => {
  expect(rect.top).not.to.be.greaterThan(bottom);
  expect(rect.bottom).not.to.be.greaterThan(bottom);
});

export const shouldNotBeInViewport = viewportCheck('not in viewport', (bottom, rect) => {
  expect(rect.top).to.be.greaterThan(bottom);
  expect(rect.bottom).to.be.greaterThan(bottom);
});

function viewportCheck(name, assert: (viewPortHeight, $el) => void) {
  return $el => {
    return cy.window({ log: false }).then(win => {
      const bottom = Cypress.$(win).height();
      const rect = $el[0].getBoundingClientRect();

      const log = Cypress.log({
        name,
        message: [$el],
        consoleProps() {
          return {
            parent: bottom,
            top: rect.top,
            bottom: rect.bottom,
          };
        },
      });
      assert(bottom, rect);

      log
        .set({ $el })
        .snapshot()
        .end();

      return cy.wrap($el, { log: false });
    });
  };
}
