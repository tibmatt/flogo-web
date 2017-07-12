import {Component, OnInit, Output, ViewChild} from "@angular/core";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {EventEmitter} from "@angular/common/src/facade/async";
import {ProfilesAPIService} from "../../../common/services/restapi/v2/profiles-api.service";

interface DeviceProfile {
  type: string;
  id: string;
}

@Component({
  selector: 'flogo-apps-profile-selection',
  templateUrl: 'profile-selection.tpl.html',
  styleUrls: ['profile-selection.less']
})
export class ProfileSelectionComponent implements OnInit{
  @ViewChild('profileSelectionModal') profileSelectionModal: ModalComponent;

  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAdd: EventEmitter<string> = new EventEmitter();

  showList: boolean = false;
  devicesList: DeviceProfile[];

  constructor(private profilesService: ProfilesAPIService) {}

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
    this.profilesService.getProfilesList().then((response) => {
      this.showList = true;
      this.devicesList = response;
    });
  }

  onAddProfile(profile) {
    this.onAdd.emit(profile);
  }
}
