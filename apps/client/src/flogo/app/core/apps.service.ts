import { defaultsDeep, cloneDeep } from 'lodash';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { App, AppsApiService, ErrorService } from '@flogo-web/client-core';

import { ApplicationDetail } from './application-detail.interface';
import { AppResourcesStateService } from './app-resources-state.service';

const DEFAULT_STATE = {
  name: {
    pendingSave: false,
    hasErrors: false,
    errors: {},
  },
  description: {
    pendingSave: false,
    hasErrors: false,
    errors: {},
  },
};

@Injectable()
export class AppDetailService {
  private currentApp$ = new BehaviorSubject<ApplicationDetail>(undefined);
  private fetching: boolean;

  constructor(
    private resourcesState: AppResourcesStateService,
    private appsApiService: AppsApiService,
    private errorService: ErrorService
  ) {}

  public currentApp(): Observable<ApplicationDetail> {
    return this.currentApp$.asObservable();
  }

  public resetApp() {
    this.currentApp$.next(null);
  }

  public load(appId: string) {
    this.fetchApp(appId).then(app => {
      this.setApp(app, DEFAULT_STATE);
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
      this.setApp(app, prevApp.state);
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
        nextApp.app = updatedApp;
        nextApp.state[prop] = {
          pendingSave: false,
          hasErrors: false,
          errors: {},
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
          errors: this.errorService.transformRestErrors(errors),
        };
        this.currentApp$.next(nextApp);
      });
  }

  public cancelUpdate(prop: string) {
    const nextApp = this.getCurrentAsEditable();
    nextApp.state[prop] = cloneDeep(DEFAULT_STATE[prop]);
    this.currentApp$.next(nextApp);
  }

  public deleteApp() {
    const currentApp = this.currentApp$.getValue().app;
    if (!currentApp) {
      return;
    }
    this.appsApiService.deleteApp(currentApp.id).then(() => {
      this.currentApp$.next(<ApplicationDetail>defaultsDeep(
        {},
        {
          // todo better signal app was deleted
          app: null,
          state: DEFAULT_STATE,
        }
      ));
    });
  }

  public toEngineSpec() {
    return this.appsApiService.exportApp(this.currentApp$.getValue().app.id);
  }

  public exportFlow(flowids) {
    return this.appsApiService.exportFlows(this.currentApp$.getValue().app.id, flowids);
  }

  public build(appId, opts: { os: string; arch: string }) {
    return this.appsApiService.buildAndDownload(appId, opts);
  }

  public getDownloadLink(appId: string): string {
    return this.appsApiService.downloadAppLink(appId);
  }

  private fetchApp(appId: string) {
    this.fetching = true;
    return this.appsApiService.getApp(appId).then((app: App) => {
      this.fetching = false;
      return app;
    });
  }

  private setApp(app: App, state: ApplicationDetail['state']) {
    this.currentApp$.next(<ApplicationDetail>defaultsDeep(
      {},
      {
        app,
        state,
      }
    ));
    this.resourcesState.triggers = app.triggers;
    this.resourcesState.resources = app.actions;
  }

  private getCurrentAsEditable() {
    return cloneDeep(this.currentApp$.getValue());
  }
}
