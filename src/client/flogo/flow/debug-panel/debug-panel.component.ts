import { isEmpty, fromPairs } from 'lodash';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, pipe } from 'rxjs';
import { debounceTime, filter, map, shareReplay, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo/core/models';
import { TestRunnerService } from '@flogo/flow/core/test-runner/test-runner.service';
import { createSaveChangesAction } from '@flogo/flow/debug-panel/save-changes-action.creator';

import { FlowActions, FlowSelectors, FlowState } from '@flogo/flow/core/state';
import { ActivitySchema, Dictionary, ItemActivityTask, StepAttribute } from '@flogo/core';
import { FormBuilderService } from '@flogo/flow/shared/dynamic-form';
import { debugPanelAnimations } from './debug-panel.animations';
import { mergeFormWithOutputs } from './utils';
import { FieldsInfo } from './fields-info';
import { isMapperActivity } from '@flogo/shared/utils';

const SELECTOR_FOR_CURRENT_ELEMENT = 'flogo-diagram-tile-task.is-selected';
const STATUS_OPEN = 'open';
const STATUS_CLOSED = 'closed';

const mapFormInputChangesToSaveAction = (store, activity$) => pipe(
  filter((formInfo: FieldsInfo) => Boolean(formInfo && formInfo.form && formInfo.form.get('input'))),
  switchMap((formInfo: FieldsInfo) => formInfo.form.get('input').valueChanges.pipe(debounceTime(250))),
  map(value => fromPairs(value.formFields.map(field => [field.name, field.value]))),
  withLatestFrom(activity$),
  switchMap(([newValues, task]) => createSaveChangesAction(store, task.id, newValues)),
  filter(action => !!action),
);

@Component({
  selector: 'flogo-flow-debug-panel',
  templateUrl: './debug-panel.component.html',
  styleUrls: ['./debug-panel.component.less'],
  animations: [
    debugPanelAnimations.panelContainer,
    debugPanelAnimations.panel,
    debugPanelAnimations.wrappedContent,
  ],
})
export class DebugPanelComponent implements OnInit, OnDestroy {

  @ViewChild('content') content: ElementRef;
  panelStatus: 'open' | 'closed' = STATUS_CLOSED;
  activity$: Observable<ItemActivityTask>;
  fields$: Observable<FieldsInfo>;
  isRunDisabled$: Observable<boolean>;
  flowHasRun$: Observable<boolean>;
  activityHasRun$: Observable<boolean>;
  executionErrrors$: Observable<Array<string>>;
  isEndOfFlow$: Observable<boolean>;
  isRestartableTask$: Observable<boolean>;

  private destroy$ = SingleEmissionSubject.create();

  constructor(
    private store: Store<FlowState>,
    private formBuilder: FormBuilder,
    private attributeFormBuilder: FormBuilderService,
    private testRunner: TestRunnerService,
  ) {}

  ngOnInit() {
    const selectAndShare = (selector) => this.store.pipe(select(selector), shareReplay(1));
    this.activity$ = selectAndShare(FlowSelectors.getSelectedActivity);
    this.isRunDisabled$ = selectAndShare(FlowSelectors.getIsRunDisabledForSelectedActivity);
    this.executionErrrors$ = selectAndShare(FlowSelectors.getCurrentActivityExecutionErrors);
    this.isRestartableTask$ =  selectAndShare(FlowSelectors.getIsRestartableTask);

    const schema$ = selectAndShare(FlowSelectors.getSelectedActivitySchema);

    this.flowHasRun$ = selectAndShare(FlowSelectors.getFlowHasRun);
    this.isEndOfFlow$ = schema$.pipe(map(isMapperActivity));
    const form$: Observable<null | FieldsInfo> = schema$.pipe(this.mapStateToForm(), shareReplay(1));
    const executionResult$ = selectAndShare(FlowSelectors.getSelectedActivityExecutionResult);
    this.activityHasRun$ = executionResult$.pipe(map(Boolean));
    this.fields$ = combineLatest(form$, this.activity$, executionResult$)
      .pipe(this.mergeToFormFields(), shareReplay(1));

    form$.pipe(
        mapFormInputChangesToSaveAction(this.store, this.activity$),
        takeUntil(this.destroy$),
      )
      .subscribe(action => this.store.dispatch(action));

    this.store
      .pipe(
        select(FlowSelectors.selectDebugPanelOpen),
        takeUntil(this.destroy$),
      )
      .subscribe(isOpen => this.panelStatus = isOpen ? STATUS_OPEN : STATUS_CLOSED);
  }

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }

  openPanel() {
    if (!this.isOpen) {
      this.changePanelState(true);
    }
  }

  closePanel(event) {
    if (this.isOpen) {
      event.stopPropagation();
      this.changePanelState(false);
    }
  }

  onAnimationEnd(event: AnimationEvent) {
    if (event.toState === STATUS_OPEN) {
      this.scrollContextElementIntoView();
    }
  }

  run() {
    this.activity$
      .pipe(
        take(1),
        switchMap(task => this.testRunner.runFromTask({ taskId: task.id, inputs: task.input }))
      ).subscribe();
  }

  get isOpen(): boolean {
    return this.panelStatus === STATUS_OPEN;
  }

  private changePanelState(isOpen: boolean) {
    this.store.dispatch(new FlowActions.DebugPanelStatusChange({ isOpen }));
  }

  private mapStateToForm() {
    return pipe(
      map((schema: ActivitySchema) => this.createFormFromSchema(schema)),
    );
  }

  private mergeToFormFields()  {
    return (source: Observable<[FieldsInfo, ItemActivityTask, Dictionary<StepAttribute>]>) => source.pipe(
      filter(([schemaForm]) => !!schemaForm),
      map(([schemaForm, activity, lastExecutionResult]) => {
        const inputForm = schemaForm && schemaForm.form.get('input');
        if (inputForm && activity) {
          this.mergeFormWithInputs(inputForm, activity);
        }
        return {
          form: mergeFormWithOutputs(schemaForm.form, lastExecutionResult),
          metadata: schemaForm && schemaForm.metadata,
        };
      }),
    );
  }

  private mergeFormWithInputs(inputForm: AbstractControl, activity: ItemActivityTask) {
    const mockInputs = activity.input || {};
    const formFieldValues = inputForm.value.formFields
      .map((fieldVal) => {
        const mockValue = mockInputs[fieldVal.name];
        if (mockValue === undefined) {
          return fieldVal;
        }
        return {
          ...fieldVal,
          value: mockValue,
        };
      });
    inputForm.patchValue({formFields: formFieldValues}, {emitEvent: false});
    return inputForm;
  }

  private createFormFromSchema(schema: ActivitySchema) {
    if (!schema) {
      return null;
    }
    const inputs = !isEmpty(schema.inputs) ? this.attributeFormBuilder.toFormGroup(schema.inputs) : null;
    const outputs = !isEmpty(schema.outputs) ? this.attributeFormBuilder.toFormGroup(schema.outputs) : null;
    const form = this.formBuilder.group({});
    if (inputs) {
      form.addControl('input', inputs.formGroup);
    }
    if (outputs) {
      outputs.formGroup.disable();
      form.addControl('output', outputs.formGroup);
    }
    return { form, metadata: { input: inputs && inputs.fieldsWithControlType, output: outputs && outputs.fieldsWithControlType } };
  }

  private scrollContextElementIntoView() {
    const contentElement: Element = this.content.nativeElement;
    const selection = contentElement.querySelector(SELECTOR_FOR_CURRENT_ELEMENT);
    if (selection) {
      selection.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
