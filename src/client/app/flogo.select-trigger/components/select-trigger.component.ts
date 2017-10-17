import {Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, ViewChild, Output} from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PostService } from '../../../common/services/post.service';
import { RESTAPITriggersService as RESTAPITriggersServiceV2 } from '../../../common/services/restapi/v2/triggers-api.service';
import { PUB_EVENTS } from '../messages';
import { FlogoProfileService } from '../../../common/services/profile.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'flogo-select-trigger',
  // moduleId: module.id,
  templateUrl: 'select-trigger.tpl.html',
  styleUrls: ['select-trigger.less']
})
export class FlogoSelectTriggerComponent implements OnInit, OnChanges {
  @ViewChild('addTriggerModal') modal: ModalComponent;
  @Input() appDetails: any;
  @Input() isAddTriggerActivated: boolean;
  @Output() onAddTriggerToAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() onInstallDialog = new EventEmitter();
  @Output() isAddTriggerActivatedChange = new EventEmitter();
  public installedTriggers = [];
  public installTriggerActivated = false;
  private addTriggerMsg: any;
  public displayExisting: boolean;

  public existingTriggers = [];
  private _isActivated = false;


  constructor(public translate: TranslateService,
              private postService: PostService,
              private profileService: FlogoProfileService,
              private triggersServiceV2: RESTAPITriggersServiceV2) {
    this.displayExisting = true;
  }

  ngOnInit() {
  }

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
    return this.triggersServiceV2.listTriggersApp(this.appDetails.appId);
  }

  loadInstalledTriggers() {

    return this.profileService.getTriggers(this.appDetails.appProfileType)
      .then(
        (triggers: any) => {
          this.installedTriggers = triggers;
          return triggers;
        }
      )
      .then((installed) => {
        this.getExistingTriggers()
          .then((triggers) => {
            if (!triggers.length) {
              this.displayExisting = false;
            }

            const allInstalled = {};

            installed.forEach((item) => {
              allInstalled[item.ref] = Object.assign({}, item);
            });

            this.existingTriggers = [];
            triggers.forEach((existing) => {
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
      .catch(
        (err: any) => {
          console.error(err);
        }
      );
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
    this.onAddTriggerToAction.emit({triggerData: trigger, installType});
  }

  openInstallTriggerDialog() {
    this.onInstallDialog.emit();
  }
}
