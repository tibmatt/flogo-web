import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  Output,
} from '@angular/core';
import { TriggersApiService } from '@flogo-web/client/core/services';
import { FlogoProfileService } from '@flogo-web/client/core/services/profile.service';
import { BsModalComponent } from 'ng2-bs3-modal';

@Component({
  selector: 'flogo-flow-select-trigger',
  templateUrl: 'select-trigger.component.html',
  styleUrls: ['select-trigger.component.less'],
})
export class FlogoSelectTriggerComponent implements OnInit, OnChanges {
  @ViewChild('addTriggerModal') modal: BsModalComponent;
  @Input() appDetails: any;
  @Input() isAddTriggerActivated: boolean;
  @Output() addTriggerToAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() installDialog = new EventEmitter();
  @Output() isAddTriggerActivatedChange = new EventEmitter();
  public installedTriggers = [];
  public displayExisting: boolean;

  public existingTriggers = [];
  private _isActivated = false;

  constructor(
    private profileService: FlogoProfileService,
    private triggersApiService: TriggersApiService
  ) {
    this.displayExisting = true;
  }

  ngOnInit() {}

  onModalCloseOrDismiss() {
    this._isActivated = false;
    this.isAddTriggerActivatedChange.emit(false);
  }

  openModal() {
    this.modal.open();
  }

  closeModal() {
    this.modal.close();
  }

  getExistingTriggers() {
    return this.triggersApiService.listTriggersForApp(this.appDetails.appId);
  }

  loadInstalledTriggers() {
    return this.profileService
      .getTriggers(this.appDetails.appProfileType)
      .then((triggers: any) => {
        this.installedTriggers = triggers;
        return triggers;
      })
      .then(installed => {
        this.getExistingTriggers().then(triggers => {
          if (!triggers.length) {
            this.displayExisting = false;
          } else if (triggers.length > 0) {
            this.displayExisting = true;
          }

          const allInstalled = {};

          installed.forEach(item => {
            allInstalled[item.ref] = Object.assign({}, item);
          });

          this.existingTriggers = [];
          triggers.forEach(existing => {
            const found = Object.assign({}, allInstalled[existing.ref]);
            if (found) {
              found.id = existing.id;
              found.name = existing.name;
              found.description = existing.description;
              this.existingTriggers.push(found);
            }
          });
        });
      })
      .then(() => {
        return this.existingTriggers;
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (_.has(changes, 'isAddTriggerActivated')) {
      this.onActivatedStatusChange(changes['isAddTriggerActivated'].currentValue);
    }
  }

  onActivatedStatusChange(newVal) {
    if (newVal !== this._isActivated) {
      this._isActivated = newVal;
      if (this._isActivated) {
        this.loadInstalledTriggers();
        this.openModal();
      } else {
        this.closeModal();
      }
    }
  }

  sendAddTriggerMsg(trigger: any, installType: string) {
    this.closeModal();
    this.addTriggerToAction.emit({ triggerData: trigger, installType });
  }

  openInstallTriggerDialog() {
    this.installDialog.emit();
  }
}
