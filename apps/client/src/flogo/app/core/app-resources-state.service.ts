import { sortBy } from 'lodash';
import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { Resource, Trigger } from '@flogo-web/core';
import { ResourcePluginManifest } from '@flogo-web/client-core';

import { RESOURCE_PLUGINS_CONFIG } from '../../core';
import { TriggerGroup } from './trigger-group.interface';
import { FlowGroup } from './flow-group.interface';
import { ResourceWithPlugin } from './resource-with-plugin';
import {
  groupByResource,
  groupByTrigger,
  sortableName,
  resourceAndPluginMerger,
} from './support';

@Injectable()
export class AppResourcesStateService {
  private readonly _resources = new BehaviorSubject<Resource[]>([]);
  private readonly _triggers = new BehaviorSubject<Trigger[]>([]);

  public readonly isEmpty$ = this._resources.asObservable().pipe(
    map(resources => !resources || resources.length <= 0),
    shareReplay(1)
  );

  public readonly resources$: Observable<ResourceWithPlugin[]>;
  public readonly groupsByTrigger$: Observable<FlowGroup[]>;
  public readonly groupsByResource$: Observable<TriggerGroup[]>;

  constructor(
    @Inject(RESOURCE_PLUGINS_CONFIG) resourcePlugins: ResourcePluginManifest[]
  ) {
    const mergeResourceWithPlugin = resourceAndPluginMerger(resourcePlugins);
    this.resources$ = this._resources.asObservable().pipe(
      map(resources => sortBy(resources, sortableName)),
      map(resources => resources.map(mergeResourceWithPlugin)),
      shareReplay(1)
    );

    const triggersAndResources$ = combineLatest(this._triggers, this.resources$).pipe(
      shareReplay(1)
    );

    this.groupsByTrigger$ = triggersAndResources$.pipe(
      map(([triggers, resources]) => groupByTrigger(triggers, resources))
    );

    this.groupsByResource$ = triggersAndResources$.pipe(
      map(([triggers, resources]) => groupByResource(triggers, resources))
    );
  }

  public set triggers(triggers: Trigger[]) {
    this._triggers.next(triggers);
  }

  public set resources(resources: Resource[]) {
    this._resources.next(resources);
  }
}
