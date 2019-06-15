import { shouldBeInViewport, shouldNotBeInViewport, testId } from '../support/helpers';

describe('Context Panel Lib', () => {
  beforeEach(() => {
    cy.visit('context-panel');
  });

  it('should reveal the panel content when opened', () => {
    const contextPanelContent = 'Inside the context panel';
    cy.get('flogo-context-panel-area').should('exist');
    cy.contains(contextPanelContent).should('not.exist');

    cy.get('flogo-context-panel-header-toggler').click();
    cy.contains(contextPanelContent);
  });

  it('should reveal the context element when the panel opens', () => {
    cy.get(testId('context-element')).then(shouldNotBeInViewport);

    cy.get('flogo-context-panel-header-toggler').click();

    cy.get(testId('context-element')).then(shouldBeInViewport);
  });
});
