import { Store } from '@ngrx/store';
import { ResourceState } from '../state/resource.state';

export class StreamDetails {
  id: string;

  constructor(id: string, private store: Store<ResourceState>) {}

  get streamState$() {
    return this.store.pipe();
  }

  removeItem(handlerType, itemId: string) {
    // this.store.dispatch();
  }

  updateMetadata(metadata) {
    // this.store.dispatch();
  }
}
