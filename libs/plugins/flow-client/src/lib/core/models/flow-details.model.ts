import { Store, select } from '@ngrx/store';

import { FlowMetadata } from '@flogo-web/client-core';

import { FlowActions, FlowSelectors } from '../state';
import { AppState } from '../state/app.state';
import { HandlerType } from './handler-type';

export class FlogoFlowDetails {
  id: string;

  constructor(id: string, private store: Store<AppState>) {}

  get runnableState$() {
    return this.store.pipe(select(FlowSelectors.getRunnableState));
  }

  get flowState$() {
    return this.store.pipe(select(FlowSelectors.selectFlowState));
  }

  removeItem(handlerType: HandlerType, itemId: string) {
    this.store.dispatch(
      new FlowActions.RemoveItem({
        handlerType,
        itemId,
      })
    );
  }

  updateMetadata(metadata: FlowMetadata) {
    this.store.dispatch(new FlowActions.UpdateMetadata(metadata));
  }
}
