import { isEqual } from 'lodash';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs/operators';

import { GraphNode, Item, UiFlow } from '@flogo-web/client/core';

import { FlowActions, FlowSelectors } from '../state';
import { AppState } from '../state/app.state';
import { HandlerType } from './handler-type';

export class FlogoFlowDetails {
  id: string;
  associatedToAppId: string;
  flow: UiFlow;

  constructor(flow, private store: Store<AppState>) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
  }

  get runnableState$() {
    return this.store.pipe(select(FlowSelectors.getRunnableState));
  }

  get itemsChange$() {
    return this.store.pipe(select(FlowSelectors.getAllItems));
  }

  get flowState$() {
    return this.store.pipe(select(FlowSelectors.selectFlowState));
  }

  get selectionChange$() {
    return this.store.pipe(
      select(FlowSelectors.selectCurrentSelection),
      distinctUntilChanged(isEqual)
    );
  }

  removeItem(handlerType: HandlerType, itemId: string) {
    this.store.dispatch(
      new FlowActions.RemoveItem({
        handlerType,
        itemId,
      })
    );
  }

  updateItem(
    handlerType: HandlerType,
    {
      item,
      node,
    }: {
      item: { id: string } & Partial<Item>;
      node?: { id: string } & Partial<GraphNode>;
    }
  ) {
    this.store.dispatch(
      new FlowActions.ItemUpdated({
        handlerType,
        item,
        node,
      })
    );
  }
}
