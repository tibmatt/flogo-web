import { isEmpty } from 'lodash';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlowSelectors, FlowState } from '@flogo/flow/core/state';
import { ActivitySchema, ItemActivityTask } from '@flogo/core';
import { debugPanelAnimations } from './debug-panel.animations';
import { FormBuilderService } from '@flogo/flow/shared/dynamic-form/form-builder.service';
import { mergeFormWithOutputs } from '@flogo/flow/debug-panel/utils';

const SELECTED_SELECTOR = 'flogo-diagram-tile-task.is-selected';

@Component({
  selector: 'flogo-flow-debug-panel',
  templateUrl: './debug-panel.component.html',
  styleUrls: ['./debug-panel.component.less'],
  animations: [debugPanelAnimations.transformPanel],
})
export class DebugPanelComponent implements OnInit {

  @ViewChild('content') content: ElementRef;
  isOpen = null;
  activity$: Observable<ItemActivityTask>;
  fields$: Observable<FormGroup>;

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
    const executionStep$ = this.store.pipe(select(FlowSelectors.getSelectedActivityExecutionResult));
    this.fields$ = combineLatest(form$, executionStep$)
      .pipe(
        map(([form, lastExecutionResult]) => mergeFormWithOutputs(form, lastExecutionResult))
      );
  }

  togglePanel() {
    this.isOpen = !this.isOpen ? 'open' : null;
  }

  onAnimationEnd(event: AnimationEvent) {
    if (event.toState === 'open') {
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
    const selection = contentElement.querySelector(SELECTED_SELECTOR);
    if (selection) {
      selection.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
