// Add new tabs here, keep TabNames and tabNames in sync
// after upgrading to typescript 2.1 this can be simplified to keyof TabNames
export type TAB_NAME = 'inputMappings' | 'iterator';
const tabNames: TAB_NAME[] = ['inputMappings', 'iterator'];

export interface Tab {
  isSelected: boolean;
  isDirty: boolean;
  isValid: boolean;
}

const makeTab = () => ({
  isSelected: false,
  isDirty: false,
  isValid: true,
});

export class Tabs implements Iterable<[TAB_NAME, Tab]> {
  private tabs: Map<TAB_NAME, Tab>;

  [Symbol.iterator]: () => Iterator<[TAB_NAME, Tab]>;

  static create(): Tabs {
    return new Tabs();
  }

  constructor() {
    const tabPairs = tabNames.map(tabName => [tabName, makeTab()] as [TAB_NAME, Tab]);
    this.tabs = new Map<TAB_NAME, Tab>(tabPairs);
    this[Symbol.iterator] = this.tabs[Symbol.iterator].bind(this.tabs);
  }

  get(tabName: TAB_NAME) {
    return this.tabs.get(tabName);
  }

  clear() {
    this.tabs.clear();
  }

  markSelected(tabName: string) {
    this.tabs.forEach((tab: Tab, currentTabName: string) => {
      tab.isSelected = tabName === currentTabName;
    });
  }

  areDirty() {
    const dirtyTab = Array.from(this.tabs.values()).find(tab => tab.isDirty);
    return !!dirtyTab;
  }

  areValid() {
    const invalidTab = Array.from(this.tabs.values()).find(tab => !tab.isValid);
    return !invalidTab;
  }

}
