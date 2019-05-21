import { isEqual } from 'lodash';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { of as observableOfValue } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AppResourceService, ResourceService } from '@flogo-web/lib-client/core';
import { ApiResource } from '@flogo-web/core';

import { StreamDetails } from './models/stream-details.model';
import { ResourceState } from './state/resource.state';
import { savableStream } from './models/backend-stream/stream.model';
import { StreamConverterModel } from './models/stream-converter.model';
import { loadFlow } from './models/load-flow';

@Injectable()
export class StreamService {
  currentStreamService: StreamDetails;
  private previousSavedStream = null;

  constructor(
    private converterService: StreamConverterModel,
    private appResourceService: AppResourceService,
    private resourceService: ResourceService,
    private store: Store<ResourceState>
  ) {}

  loadStream(resource: ApiResource) {
    this.previousSavedStream = null;

    const fetchSubstreams = substreamIds =>
      this.resourceService.listSubresources(resource.appId, substreamIds);
    const convertServerToUIModel = (fromResource, linkedSubflows) =>
      this.converterService.convertToWebFlowModel(fromResource, linkedSubflows);
    return loadFlow(fetchSubstreams, convertServerToUIModel, resource).pipe(
      tap(({ convertedFlow, triggers, handlers, linkedSubflows }) => {
        this.currentStreamService = new StreamDetails(resource.id, this.store);
        this.previousSavedStream = savableStream(convertedFlow);
        /*this.store.dispatch(
          new Init({
            ...convertedFlow,
            triggers,
            handlers,
            linkedSubflows,
          })
        );*/
      }),
      map(({ convertedFlow, flowTriggers }) => ({
        stream: convertedFlow,
        triggers: flowTriggers,
      }))
    );
  }

  saveStreamIfChanged(streamId, uiModel) {
    const stream = savableStream(uiModel);
    if (this.didStreamChange(stream)) {
      this.previousSavedStream = stream;
      return this.resourceService.updateResource(streamId, stream);
    } else {
      return observableOfValue(false);
    }
  }

  deleteStream(streamId, triggerId) {
    return this.appResourceService
      .deleteResourceWithTrigger(streamId, triggerId)
      .toPromise();
  }

  listStreamsByName(appId, name) {
    return this.resourceService.listResourcesWithName(name, appId).toPromise();
  }

  listStreamsForApp(appId) {
    return this.resourceService.listSubresources(appId);
  }

  private didStreamChange(nextValue) {
    return !isEqual(this.previousSavedStream, nextValue);
  }
}
