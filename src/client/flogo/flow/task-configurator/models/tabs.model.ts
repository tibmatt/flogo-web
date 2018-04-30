// Add new tabs here, keep TabNames and defaultTabsInfo in sync
// after upgrading to typescript 2.1 this can be simplified to keyof TabNames
export type TAB_NAME = 'subFlow' | 'inputMappings' | 'iterator' | 'flowInput' |'flowOutput';


export interface Tab {
  labelKey: string;
  isSelected: boolean;
  isDirty: boolean;
  isValid: boolean;
  enabled: boolean;
  inputsLabelKey?: string;
  outputsLabelKey?: string;
}

export const makeTab = (labelKey: string) => ({
  labelKey,
  isSelected: false,
  isDirty: false,
  isValid: true,
  enabled: true,
});

export class Tabs implements Iterable<[TAB_NAME, Tab]> {
  private tabs: Map<TAB_NAME, Tab>;

  [Symbol.iterator]: () => Iterator<[TAB_NAME, Tab]>;

  static create(tabsInfo: any[]): Tabs {
    return new Tabs(tabsInfo);
  }

  constructor(tabsInfo: any[]) {
    const tabPairs = tabsInfo.map(({name, labelKey}) => [name, makeTab(labelKey)] as [TAB_NAME, Tab]);
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
