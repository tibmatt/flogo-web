import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfiguratorService as TriggerConfiguratorService} from './configurator.service';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import {ModalStatus} from '@flogo/flow/triggers/configurator/configurator.service';
import {animate, group, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'flogo-triggers-configuration',
  templateUrl: 'configurator.component.html',
  styleUrls: [
    '../../../../assets/_mapper-modal.less',
    'configurator.component.less'
  ],
  animations: [
    trigger('configurationPanel', [
      state('*', style({
        backgroundColor: '#fff',
        position: 'fixed',
        width: '100%',
        height: '100%',
        bottom: 0,
        left: 0,
        // firefox has issues with shorthand syntax for padding and margin
        paddingLeft: '60px',
        paddingRight: '60px',
        paddingTop: '60px',
        paddingBottom: '60px',
        zIndex: 3,
      })),
      transition('void => *', [
        group([
          style({position: 'fixed', width: '0px', top: '150px'}),
          animate('350ms cubic-bezier(0.4, 0.0, 0.2, 1)')
        ])
      ]),
      transition('* => void', [
        group([
          style({position: 'fixed', bottom: 0, left: 0}),
          animate('350ms 200ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({
            width: '*',
            top: '150px',
            overflow: 'hidden'
          }))
        ])
      ])
    ])
  ]
})

export class ConfiguratorComponent implements OnInit, OnDestroy {

  currentModalStatus: ModalStatus = {
    isOpen: false,
    flowMetadata: null,
    triggerSchema: null,
    handler: null,
    trigger: null
  };

  private ngDestroy = SingleEmissionSubject.create();

  constructor(private triggerConfiguratorService: TriggerConfiguratorService) {
  }

  ngOnInit() {
    this.triggerConfiguratorService.modalStatus$
      .takeUntil(this.ngDestroy)
      .subscribe(nextStatus => this.onNextStatus(nextStatus));
  }

  onNextStatus(nextStatus: ModalStatus) {
    this.currentModalStatus = Object.assign({}, nextStatus);
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  onCloseOrDismiss() {
    this.triggerConfiguratorService.close();
  }

  onSave() {
  }
}
