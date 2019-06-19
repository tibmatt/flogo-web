import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  OnChanges,
  HostBinding,
  SimpleChanges,
} from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';
import { CONTRIB_REFS } from '@flogo-web/core';

@Component({
  selector: 'flogo-flow-task-add-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.less'],
})
export class ActivityComponent implements Highlightable, OnChanges {
  @Input() activity;
  @Output() selected = new EventEmitter();
  @HostBinding('class.is-active') isHighlighted = false;
  @HostBinding('class.is-subflow') isSubflow: boolean;
  disabled = false;

  ngOnChanges({ activity }: SimpleChanges) {
    if (activity) {
      this.isSubflow = activity.currentValue.ref === CONTRIB_REFS.SUBFLOW;
    }
  }

  @HostListener('click')
  select() {
    this.selected.emit(this.activity);
  }

  setActiveStyles() {
    this.isHighlighted = true;
  }

  setInactiveStyles() {
    this.isHighlighted = false;
  }
}
