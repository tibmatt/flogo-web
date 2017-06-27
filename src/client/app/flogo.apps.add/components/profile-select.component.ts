import {Component, OnInit, ViewChild} from "@angular/core";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {EventEmitter} from "@angular/common/src/facade/async";
import {ProfilesAPIService} from "../../../common/services/restapi/v2/profiles-api.service";

interface DeviceProfile {
  type: string;
  i18nKey: string;
}

@Component({
  selector: 'flogo-apps-profile-selection',
  templateUrl: 'profile-selection.tpl.html',
  outputs: ['onClose', 'onAdd'],
  styleUrls: ['profile-selection.less']
})
export class ProfileSelectionComponent implements OnInit{
  @ViewChild('profileSelectionModal') profileSelectionModal: ModalComponent;

  onClose: EventEmitter<any> = new EventEmitter();
  onAdd: EventEmitter<string> = new EventEmitter();

  showList: boolean = false;
  devicesList: DeviceProfile[];

  constructor(private _profilesService: ProfilesAPIService) {}

  ngOnInit() {
    this.openModal();
  }

  openModal() {
    this.profileSelectionModal.open();
  }

  closeModal() {
    this.profileSelectionModal.close();
    this.onModalCloseOrDismiss();
  }

  onModalCloseOrDismiss() {
    this.onClose.emit();
  }

  showDevicesList() {
    this._profilesService.getProfilesList().then((response) => {
      this.showList = true;
      this.devicesList = response;
    });
  }

  onAddProfile(profile) {
    this.onAdd.emit(profile);
  }
}
