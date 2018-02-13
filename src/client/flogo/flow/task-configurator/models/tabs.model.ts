// Add new tabs here, keep TabNames and defaultTabsInfo in sync
// after upgrading to typescript 2.1 this can be simplified to keyof TabNames
export type TAB_NAME = 'subFlow' | 'inputMappings' | 'iterator' ;
const defaultTabsInfo: {name: TAB_NAME, labelKey: string}[] = [
  { name: 'subFlow', labelKey: 'TASK-CONFIGURATOR:TABS:SUB-FLOW' },
  { name: 'inputMappings', labelKey: 'TASK-CONFIGURATOR:TABS:MAP-INPUTS' },
  { name: 'iterator', labelKey: 'TASK-CONFIGURATOR:TABS:ITERATOR' },
];

export interface Tab {
  labelKey: string;
  isSelected: boolean;
  isDirty: boolean;
  isValid: boolean;
}

export const makeTab = (labelKey: string) => ({
  labelKey,
  isSelected: false,
  isDirty: false,
  isValid: true,
});

export class Tabs implements Iterable<[TAB_NAME, Tab]> {
  private tabs: Map<TAB_NAME, Tab>;

  [Symbol.iterator]: () => Iterator<[TAB_NAME, Tab]>;

  static create(isSubFlow: boolean): Tabs {
    return new Tabs(isSubFlow);
  }

  constructor(includeSubFlow: boolean) {
    const tabPairs = defaultTabsInfo.filter(val => val.name !== 'subFlow' || (val.name === 'subFlow' && includeSubFlow))
      .map(({ name, labelKey }) => [name, makeTab(labelKey)] as [TAB_NAME, Tab]);
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
