import { snakeCase } from 'lodash';
import { differenceInSeconds } from 'date-fns';

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { Observable, of as observableOf, combineLatest } from 'rxjs';
import {
  switchMap,
  map,
  take,
  tap,
  filter,
  shareReplay,
  distinctUntilKeyChanged,
  takeUntil,
} from 'rxjs/operators';

import { App, Trigger, CONTRIB_REFS } from '@flogo-web/core';
import {
  LanguageService,
  FlowSummary,
  ERROR_CODE,
  LocalStorageService,
  SanitizeService,
  ShimTriggerBuildApiService,
  RESTAPIContributionsService,
  ContribSchema,
  SingleEmissionSubject,
} from '@flogo-web/lib-client/core';
import { ModalService } from '@flogo-web/lib-client/core/modal';
import {
  ConfirmationResult,
  ConfirmationModalService,
} from '@flogo-web/lib-client/core/confirmation';
import { NotificationsService } from '@flogo-web/lib-client/core/notifications';
import {
  AppDetailService,
  SETTING_DONT_WARN_MISSING_TRIGGERS,
  FlowGroup,
  AppResourcesStateService,
} from '../core';
import {
  NewResourceComponent,
  NewResourceData,
} from '../new-resource/new-resource.component';
import {
  ExportFlowsData,
  FlogoExportFlowsComponent,
} from '../export-flows/export-flows.component';

import {
  ShimTriggerData,
  TriggerShimBuildComponent,
} from '../shim-trigger/shim-trigger.component';
import {
  MissingTriggerConfirmationComponent,
  ConfirmationResult as MissingTriggerConfirmationResult,
  ConfirmationParams,
} from '../missing-trigger-confirmation';
import { ResourceViewType, DeleteEvent } from '../resource-views';
import { BUILD_OPTIONS } from './build-options';

const MAX_SECONDS_TO_ASK_APP_NAME = 5;

interface FieldUiState {
  inEditMode: boolean;
  value?: string;
  errors?: { [key: string]: string };
}

@Component({
  selector: 'flogo-apps-details-application',
  templateUrl: 'app-detail.component.html',
  styleUrls: ['app-detail.component.less'],
})
export class FlogoApplicationDetailComponent implements OnDestroy, OnChanges, OnInit {
  @Input() appId: string;
  @Output() resourceSelected = new EventEmitter<FlowSummary>();
  @Output() appDeleted = new EventEmitter<void>();

  application: App;

  nameUiState: FieldUiState = {
    inEditMode: false,
  };
  autofocusName = false;

  descriptionUiState: FieldUiState = {
    inEditMode: false,
  };

  resourceViewType: ResourceViewType = 'resources';

  isDetailsMenuOpen = false;
  isExportBoxShown = false;

  buildOptions = BUILD_OPTIONS;
  isBuildBoxShown = false;
  isBuilding: boolean;

  shimmableTriggerSchema$: Observable<ContribSchema[]>;
  shimTriggerOptions = [];

  private destroyed$ = SingleEmissionSubject.create();

  constructor(
    public resourcesState: AppResourcesStateService,
    private translate: LanguageService,
    private appDetailService: AppDetailService,
    private confirmationModalService: ConfirmationModalService,
    private sanitizer: SanitizeService,
    private contributionService: RESTAPIContributionsService,
    private shimTriggersApiService: ShimTriggerBuildApiService,
    private notificationsService: NotificationsService,
    private modalService: ModalService,
    private localStorage: LocalStorageService
  ) {}

  ngOnChanges({ appId: appIdChange }: SimpleChanges) {
    if (appIdChange && this.appId) {
      this.appDetailService.load(this.appId);
    }
  }

  ngOnInit() {
    this.shimmableTriggerSchema$ = this.contributionService
      .getShimContributionDetails()
      .pipe(shareReplay(1));
    this.appDetailService.app$.subscribe(app => {
      this.application = app;
    });
    const takeUntilDestroyed = takeUntil(this.destroyed$);

    this.resourcesState.triggers$.pipe(takeUntilDestroyed).subscribe(() => {
      this.loadShimTriggerBuildOptions();
    });

    this.appDetailService.app$
      .pipe(
        distinctUntilKeyChanged('id'),
        takeUntilDestroyed
      )
      .subscribe(() => {
        this.focusNameFieldIfNewApp();
      });
  }

  ngOnDestroy() {
    this.destroyed$.emitAndComplete();
  }

  appExporter() {
    return () => {
      this.closeExportBox();
      return this.confirmActionWhenMissingTriggers('export')
        .toPromise()
        .then(proceed => {
          if (!proceed) {
            return null;
          }
          return this.performExportApp();
        });
    };
  }

  private performExportApp() {
    return this.appDetailService
      .toEngineSpec()
      .then(engineApp => {
        const appName = snakeCase(engineApp.name);
        return [
          {
            fileName: `${appName}.json`,
            data: engineApp,
          },
        ];
      })
      .catch(errRsp => {
        if (
          errRsp &&
          errRsp.errors &&
          errRsp.errors[0] &&
          errRsp.errors[0].code === ERROR_CODE.HAS_SUBFLOW
        ) {
          this.notificationsService.error({
            key: 'DETAILS-EXPORT:CANNOT-EXPORT',
          });
        } else {
          console.error(errRsp.errors);
          this.notificationsService.error({
            key: 'DETAILS-EXPORT:ERROR_UNKNOWN',
          });
        }
      });
  }

  buildApp({ os, arch }) {
    this.closeBuildBox();
    this.confirmActionWhenMissingTriggers('build')
      .pipe(filter(Boolean))
      .subscribe(() =>
        this.handleBuildDownload(
          this.appDetailService.build(this.application.id, { os, arch })
        )
      );
  }

  buildShimTrigger(selectedTriggerDetails) {
    this.handleBuildDownload(
      this.shimTriggersApiService.buildShimTrigger(selectedTriggerDetails)
    );
  }

  openCreateFlowFromTrigger(trigger: Trigger) {
    this.openCreateResource(trigger.id);
  }

  openCreateResource(triggerId?: string) {
    const newFlowData: NewResourceData = { appId: this.application.id };
    if (triggerId) {
      newFlowData.triggerId = triggerId;
    }
    return this.modalService
      .openModal<NewResourceData>(NewResourceComponent, newFlowData)
      .result.pipe(filter(Boolean))
      .subscribe(({ name, description, type }) => {
        this.appDetailService.createResource({ name, description, type }, triggerId);
      });
  }

  onClickAddDescription() {
    this.descriptionUiState = {
      ...this.descriptionUiState,
      inEditMode: true,
      value: this.application.description,
    };
  }

  openExportFlow() {
    const flows = this.application.resources;
    return this.modalService.openModal<ExportFlowsData>(FlogoExportFlowsComponent, {
      flows,
    });
  }

  onNameSave() {
    let editableName = this.nameUiState.value || '';
    editableName = editableName.trim();
    if (!editableName) {
      return;
    }
    editableName = this.sanitizer.sanitizeHTMLInput(editableName);
    this.nameUiState.inEditMode = false;
    this.nameUiState.errors = null;
    this.appDetailService.updateProperty('name', editableName).subscribe(null, errors => {
      this.nameUiState = {
        inEditMode: true,
        value: editableName,
        errors,
      };
      this.autofocusName = false;
      setTimeout(() => (this.autofocusName = true), 100);
    });
  }

  onNameCancel() {
    this.nameUiState = {
      inEditMode: false,
    };
  }

  onDescriptionSave() {
    this.descriptionUiState = { ...this.descriptionUiState, inEditMode: false };
    const description = this.sanitizer.sanitizeHTMLInput(this.descriptionUiState.value);
    this.appDetailService.updateProperty('description', description);
  }

  onDescriptionCancel() {
    this.descriptionUiState = { inEditMode: false };
  }

  onClickLabelDescription() {
    this.descriptionUiState = { inEditMode: true, value: this.application.description };
  }

  onClickLabelName() {
    this.nameUiState = { inEditMode: true, value: this.application.name };
  }

  onResourceSelected(flow) {
    this.resourceSelected.emit(flow);
  }

  onFlowDelete({ resource, triggerId }: DeleteEvent) {
    this.appDetailService.removeResource(resource.id, triggerId);
  }

  onDeleteApp(application) {
    this.closeDetailsMenu();
    this.translate
      .get(['APP-DETAIL:CONFIRM_DELETE', 'MODAL:CONFIRM-DELETION'], {
        appName: application.name,
      })
      .pipe(
        switchMap(translation => {
          return this.confirmationModalService.openModal({
            title: translation['MODAL:CONFIRM-DELETION'],
            textMessage: translation['APP-DETAIL:CONFIRM_DELETE'],
          }).result;
        }),
        switchMap(result => {
          return result === ConfirmationResult.Confirm
            ? this.appDetailService.deleteApp()
            : observableOf(false);
        })
      )
      .subscribe(isDeleted => {
        if (isDeleted) {
          this.appDeleted.emit();
        }
      });
  }

  toggleBuildBox() {
    this.isBuildBoxShown = !this.isBuildBoxShown;
  }

  closeBuildBox() {
    this.isBuildBoxShown = false;
  }

  showShimTriggerList(ref) {
    const isLambdaTrigger = ref === CONTRIB_REFS.LAMBDA;
    this.resourcesState.groupsByTrigger$
      .pipe(
        take(1),
        map((flowGroups: FlowGroup[]) =>
          flowGroups.filter(
            flowGroup => flowGroup.trigger && flowGroup.trigger.ref === ref
          )
        ),
        switchMap(shimTriggersList => {
          if (isLambdaTrigger && shimTriggersList.length === 1) {
            return observableOf({ triggerId: shimTriggersList[0].trigger.id });
          } else {
            return this.modalService.openModal<ShimTriggerData>(
              TriggerShimBuildComponent,
              {
                shimTriggersList,
                buildOptions: this.buildOptions,
              }
            ).result;
          }
        })
      )
      .subscribe(buildParams => {
        if (buildParams) {
          this.buildShimTrigger(buildParams);
        }
      });
    this.closeBuildBox();
  }

  toggleExportBox() {
    this.isExportBoxShown = !this.isExportBoxShown;
  }

  closeExportBox() {
    this.isExportBoxShown = false;
  }

  resourceViewChanged(viewType: ResourceViewType) {
    this.resourceViewType = viewType;
  }

  toggleDetailsMenu() {
    this.isDetailsMenuOpen = !this.isDetailsMenuOpen;
  }

  closeDetailsMenu() {
    this.isDetailsMenuOpen = false;
  }

  private confirmActionWhenMissingTriggers(
    exportType: 'export' | 'build'
  ): Observable<boolean> {
    if (this.localStorage.getItem(SETTING_DONT_WARN_MISSING_TRIGGERS)) {
      return observableOf(true);
    }

    return this.resourcesState.triggers$.pipe(
      take(1),
      switchMap(triggers => {
        const appHasTriggers = triggers && triggers.length > 0;
        return !appHasTriggers
          ? this.showTriggerConfirmation(exportType)
          : observableOf(true);
      })
    );
  }

  private showTriggerConfirmation(exportType) {
    return this.modalService
      .openModal<ConfirmationParams>(MissingTriggerConfirmationComponent, {
        type: exportType,
      })
      .result.pipe(
        take(1),
        tap((result: MissingTriggerConfirmationResult) => {
          if (result && result.dontShowAgain) {
            this.localStorage.setItem(SETTING_DONT_WARN_MISSING_TRIGGERS, 'true');
          }
        }),
        map(result => result && result.confirm)
      );
  }

  private handleBuildDownload(download: Observable<any>) {
    const restoreBuildFlag = () => (this.isBuilding = false);
    const handleBuildError = () => {
      this.notificationsService.error({ key: 'DETAILS:BUILD-ERROR' });
      restoreBuildFlag();
    };

    this.isBuilding = true;
    download.subscribe(restoreBuildFlag, handleBuildError);
  }

  private focusNameFieldIfNewApp() {
    if (this.application.updatedAt && this.nameUiState.inEditMode) {
      this.nameUiState = {
        inEditMode: false,
      };
      return;
    }
    const secondsSinceCreation = differenceInSeconds(
      Date.now(),
      this.application.createdAt
    );
    const isNewApp = secondsSinceCreation <= MAX_SECONDS_TO_ASK_APP_NAME;
    this.nameUiState = { inEditMode: isNewApp, value: this.application.name };
  }

  private getUniqueTriggerRefs(): Observable<Set<string>> {
    return this.resourcesState.groupsByTrigger$.pipe(
      map(flowGroups => {
        return new Set(
          flowGroups.reduce((triggerRefs, group) => {
            return group.trigger ? [...triggerRefs, group.trigger.ref] : triggerRefs;
          }, [])
        );
      })
    );
  }

  private loadShimTriggerBuildOptions() {
    this.shimTriggerOptions = [];
    combineLatest(this.getUniqueTriggerRefs(), this.shimmableTriggerSchema$)
      .pipe(
        take(1),
        map(([triggerRefs, shimmableTriggersDetails]) => {
          return shimmableTriggersDetails
            .filter(shimmableTriggerDetail => triggerRefs.has(shimmableTriggerDetail.ref))
            .map(shimmableTriggerDetail =>
              getShimmableTriggerBuildOption(shimmableTriggerDetail)
            );
        })
      )
      .subscribe(shimTriggerOptions => {
        this.shimTriggerOptions = shimTriggerOptions;
      });
  }
}

function getShimmableTriggerBuildOption(shimmableTriggerDetail: ContribSchema) {
  switch (shimmableTriggerDetail.ref) {
    case CONTRIB_REFS.LAMBDA:
      return {
        labelKey: 'TRIGGER-SHIM:SERVERLESS-APP',
        ref: shimmableTriggerDetail.ref,
      };
    case CONTRIB_REFS.CLI:
      return {
        labelKey: 'TRIGGER-SHIM:CLI-APP',
        ref: shimmableTriggerDetail.ref,
      };
    default:
      return {
        labelKey: shimmableTriggerDetail.name,
        ref: shimmableTriggerDetail.ref,
      };
  }
}
