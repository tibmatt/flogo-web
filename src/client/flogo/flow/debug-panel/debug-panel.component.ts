import { isEmpty } from 'lodash';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlowActions, FlowSelectors, FlowState } from '@flogo/flow/core/state';
import { ActivitySchema, ItemActivityTask } from '@flogo/core';
import { debugPanelAnimations } from './debug-panel.animations';
import { FormBuilderService } from '@flogo/flow/shared/dynamic-form/form-builder.service';
import { mergeFormWithOutputs } from '@flogo/flow/debug-panel/utils';

const SELECTOR_FOR_CURRENT_ELEMENT = 'flogo-diagram-tile-task.is-selected';
const OPEN_STATE = 'open';

@Component({
  selector: 'flogo-flow-debug-panel',
  templateUrl: './debug-panel.component.html',
  styleUrls: ['./debug-panel.component.less'],
  animations: [debugPanelAnimations.transformPanel],
})
export class DebugPanelComponent implements OnInit, OnDestroy {

  @ViewChild('content') content: ElementRef;
  isOpen: string;
  activity$: Observable<ItemActivityTask>;
  fields$: Observable<FormGroup>;

  private isOpenSubscription: Subscription;

  constructor(private store: Store<FlowState>, private formBuilder: FormBuilder, private attributeFormBuilder: FormBuilderService) {
  }

  ngOnInit() {
    this.activity$ = this.store.pipe(
      select(FlowSelectors.getSelectedActivity),
    );

    const form$: Observable<null | FormGroup> = this.store.pipe(
      select(FlowSelectors.getSelectedActivitySchema),
      map((schema: ActivitySchema) => this.createFormFromSchema(schema)),
    );
    this.fields$ = combineLatest(
      form$,
      this.store.pipe(select(FlowSelectors.getSelectedActivityExecutionResult))
    ).pipe(
      map(([form, lastExecutionResult]) => mergeFormWithOutputs(form, lastExecutionResult))
    );

    this.isOpenSubscription = this.store.pipe(select(FlowSelectors.selectDebugPanelOpen))
      .subscribe(isOpen => this.isOpen = isOpen ? OPEN_STATE : null);
  }

  ngOnDestroy() {
    this.isOpenSubscription.unsubscribe();
  }

  togglePanel() {
    this.store.dispatch(new FlowActions.DebugPanelStatusChange({ isOpen: !this.isOpen }));
  }

  onAnimationEnd(event: AnimationEvent) {
    if (event.toState === OPEN_STATE) {
      this.scrollContextElementIntoView();
    }
  }

  private createFormFromSchema(schema: ActivitySchema) {
    if (!schema) {
      return null;
    }
    const inputs = !isEmpty(schema.inputs) ? this.attributeFormBuilder.toFormGroup(schema.inputs).formGroup : null;
    const outputs = !isEmpty(schema.outputs) ? this.attributeFormBuilder.toFormGroup(schema.outputs).formGroup : null;
    const form = this.formBuilder.group({});
    if (inputs) {
      form.addControl('input', inputs);
    }
    if (outputs) {
      form.addControl('output', outputs);
    }
    form.disable();
    return form;
  }

  private scrollContextElementIntoView() {
    const contentElement: Element = this.content.nativeElement;
    const selection = contentElement.querySelector(SELECTOR_FOR_CURRENT_ELEMENT);
    if (selection) {
      selection.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
