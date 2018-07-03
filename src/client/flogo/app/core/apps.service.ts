import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AppsApiService } from '@flogo/core/services/restapi/v2/apps-api.service';
import { ErrorService } from '@flogo/core/services/error.service';

import { App } from './app.interface';
import { ApplicationDetail } from './application-detail.interface';
import { TriggerGroup } from './trigger-group.interface';
import { FlowGroup } from './flow-group.interface';
import { APP_MODELS, App as BackendApp } from '@flogo/core';
import {getProfileType} from '@flogo/shared/utils';

const DEFAULT_STATE = {
  name: {
    pendingSave: false,
    hasErrors: false,
    errors: {}
  },
  description: {
    pendingSave: false,
    hasErrors: false,
    errors: {}
  }
};

@Injectable()
export class AppDetailService {

  private currentApp$ = new BehaviorSubject<ApplicationDetail>(undefined);
  private fetching: boolean;

  constructor(private appsApiService: AppsApiService, private errorService: ErrorService) {
  }

  public currentApp(): Observable<ApplicationDetail> {
    return this.currentApp$.asObservable();
  }

  public resetApp() {
    this.currentApp$.next(null);
  }

  public load(appId: string) {
    this.fetchApp(appId).then(app => {
      this.currentApp$.next(<ApplicationDetail>_.defaultsDeep({}, {
        app: this.transform(app),
        state: DEFAULT_STATE
      }));
    });
  }

  public reload() {
    this.fetching = true;
    const currentApp = this.currentApp$.getValue();
    if (!currentApp) {
      return;
    }
    this.fetchApp(currentApp.app.id).then(app => {
      const prevApp = this.currentApp$.getValue();
      this.currentApp$.next(<ApplicationDetail>_.defaultsDeep({}, {
        app: this.transform(app),
        state: prevApp.state
      }));
    });
  }

  public update(prop: string, value: any) {
    const appToUpdate = this.getCurrentAsEditable();
    const appToUpdateId = appToUpdate.app.id;
    if (!appToUpdate.state[prop]) {
      appToUpdate.state[prop] = {};
    }
    appToUpdate.state[prop].pendingSave = true;
    this.currentApp$.next(appToUpdate);

    const isRequestStillApplicable = (forAppId: string) => {
      const nextApp = this.currentApp$.getValue();
      // make sure current app has not changed
      return nextApp.app.id === forAppId;
    };

    this.appsApiService
      .updateApp(appToUpdate.app.id, { [prop]: value })
      .then(updatedApp => {
        if (!isRequestStillApplicable(appToUpdateId)) {
          return;
        }
        const nextApp = this.getCurrentAsEditable();
        nextApp.app = this.transform(updatedApp);
        nextApp.state[prop] = {
          pendingSave: false,
          hasErrors: false,
          errors: {}
        };
        this.currentApp$.next(nextApp);
      })
      .catch(errors => {
        if (!isRequestStillApplicable(appToUpdateId)) {
          return;
        }
        const nextApp = this.getCurrentAsEditable();
        nextApp.state[prop] = {
          pendingSave: false,
          hasErrors: !!errors.length,
          errors: this.errorService.transformRestErrors(errors)
        };
        this.currentApp$.next(nextApp);
      });
  }

  public cancelUpdate(prop: string) {
    const nextApp = this.getCurrentAsEditable();
    nextApp.state[prop] = _.cloneDeep(DEFAULT_STATE[prop]);
    this.currentApp$.next(nextApp);
  }

  public deleteApp() {
    const currentApp = this.currentApp$.getValue().app;
    if (!currentApp) {
      return;
    }
    this.appsApiService.deleteApp(currentApp.id)
      .then(() => {
        this.currentApp$.next(<ApplicationDetail>_.defaultsDeep({}, {
          // todo better signal app was deleted
          app: null,
          state: DEFAULT_STATE
        }));
      });
  }

  public toEngineSpec(isLegacyExport?: boolean) {
    const appModel = isLegacyExport ? APP_MODELS.LEGACY : APP_MODELS.STANDARD;
    return this.appsApiService.exportApp(this.currentApp$.getValue().app.id, { appModel });
  }

  public exportFlow(flowids, isLegacyExport?: boolean) {
    let appModel;
    if (isLegacyExport) {
      appModel = APP_MODELS.LEGACY;
    }
    return this.appsApiService.exportFlows(this.currentApp$.getValue().app.id, flowids, appModel);
  }

  public build(appId, opts: { os: string, arch: string }) {
    return this.appsApiService.buildAndDownload(appId, opts);
  }

  public getDownloadLink(appId: string): string {
    return this.appsApiService.downloadAppLink(appId);
  }

  private fetchApp(appId: string) {
    this.fetching = true;
    return this.appsApiService.getApp(appId)
      .then((app: App) => {
        this.fetching = false;
        return app;
      });
  }

  private getCurrentAsEditable() {
    return _.cloneDeep(this.currentApp$.getValue());
  }

  private transform(app: App | BackendApp): App {
    const triggers = app.triggers || [];
    const actions = app.actions || [];
    const profileType = getProfileType(app);
    return <App> Object.assign({}, app, {
      profileType,
      flowGroups: this.makeFlowGroups(triggers, actions)
    }, {
      triggerGroups: this.makeTriggerGroups(triggers, actions)
    });
  }

  private makeFlowGroups(triggers, actions): FlowGroup[] {
    let handlers = [];
    triggers.forEach(t => {
      handlers = handlers.concat(t.handlers);
    });
    const orphanActions = actions.filter(a => !handlers.find(h => h.actionId === a.id));
    const orphanActionMap = new Map(<[string, any][]> orphanActions.map(a => [a.id, a]));
    const actionMap = new Map(<[string, any][]> actions.map(a => [a.id, a]));

    const pullAction = actionId => {
      const action = actionMap.get(actionId);
      return action;
    };

    const triggerGroups = triggers.map(trigger => {
      return {
        trigger: trigger,
        flows: trigger.handlers
          .map(h => pullAction(h.actionId))
          .filter(flow => !!flow),
      };
    }).filter(triggerGroup => triggerGroup.flows.length > 0);

    // orphan flows
    if (orphanActionMap.size) {
      triggerGroups.unshift({
        trigger: null,
        flows: Array.from(orphanActionMap.values()),
      });
    }

    return triggerGroups;
  }

  private makeTriggerGroups(triggers, actions): TriggerGroup[] {
    return actions.map(action => {
      return {
        flow: action,
        triggers: triggers.filter(t => !!t.handlers.find(h => h.actionId === action.id))
      };
    }).map(actionGroup => {
      actionGroup.triggers = actionGroup.triggers.length > 0 ? actionGroup.triggers : null;
      return actionGroup;
    });
  }

}

