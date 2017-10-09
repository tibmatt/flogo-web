import {Injectable} from '@angular/core';

@Injectable()
export class FlogoTriggerClickHandlerService {
  private _currentTriggerBlock: Element;

  setCurrentTriggerBlock(el: Element) {
    this._currentTriggerBlock = el;
  }

  isClickedOutside(eventPath: Element[]) {
    return !eventPath.find(el => el === this._currentTriggerBlock);
  }

  resetCurrentTriggerBlock() {
    this._currentTriggerBlock = null;
  }
}
