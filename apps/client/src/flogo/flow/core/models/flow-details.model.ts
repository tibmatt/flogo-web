import { isEqual } from 'lodash';
import { Store } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs/operators';

import { GraphNode, Item, UiFlow } from '@flogo-web/client/core';

import { FLOGO_PROFILE_TYPE } from '@flogo-web/client/core/constants';
import { getProfileType } from '@flogo-web/client/shared/utils';

import { FlowActions, FlowSelectors } from '../state';
import { AppState } from '../state/app.state';
import { HandlerType } from './handler-type';

export class FlogoFlowDetails {
  id: string;
  associatedToAppId: string;
  applicationProfileType: FLOGO_PROFILE_TYPE;
  flow: UiFlow;

  constructor(flow, private store: Store<AppState>) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
    this.applicationProfileType = getProfileType(flow.app);
  }

  get runnableState$() {
    return this.store.select(FlowSelectors.getRunnableState);
  }

  get itemsChange$() {
    return this.store.select(FlowSelectors.getAllItems);
  }

  get flowState$() {
    return this.store.select(FlowSelectors.selectFlowState);
  }

  get selectionChange$() {
    return this.store.select(FlowSelectors.selectCurrentSelection).pipe(distinctUntilChanged(isEqual));
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
    { item, node }: { item: { id: string } & Partial<Item>; node?: { id: string } & Partial<GraphNode> }
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
