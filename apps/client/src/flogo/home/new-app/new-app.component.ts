import { Component, AfterViewInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';
import { ProfilesAPIService } from '../../core/services/restapi/v2/profiles-api.service';
import { FLOGO_PROFILE_TYPE } from '../../core/constants';

interface DeviceProfile {
  type: string;
  id: string;
}

@Component({
  selector: 'flogo-home-new-app',
  templateUrl: 'new-app.component.html',
  styleUrls: ['new-app.component.less'],
})
export class FlogoNewAppComponent implements AfterViewInit {
  @ViewChild('newAppModal') newAppModal: BsModalComponent;

  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() add: EventEmitter<any> = new EventEmitter();

  showList = false;
  devicesList: DeviceProfile[];
  FLOGO_PROFILE_TYPE: typeof FLOGO_PROFILE_TYPE = FLOGO_PROFILE_TYPE;

  constructor(private profilesService: ProfilesAPIService) {}

  ngAfterViewInit() {
    this.openModal();
  }

  openModal() {
    this.newAppModal.open();
  }

  closeModal() {
    this.newAppModal.close();
    this.onModalCloseOrDismiss();
  }

  onModalCloseOrDismiss() {
    this.close.emit();
  }

  showDevicesList() {
    this.profilesService.getProfilesList().then(response => {
      this.showList = true;
      this.devicesList = response;
    });
  }

  onAddProfile(profileType: FLOGO_PROFILE_TYPE, profile?: string) {
    const profileDetails: any = { profileType };
    if (profileType === FLOGO_PROFILE_TYPE.DEVICE) {
      profileDetails.profile = 'github.com/TIBCOSoftware/flogo-contrib/device/profile/feather_m0_wifi';
      profileDetails.deviceType = profile;
      profileDetails.settings = {
        'mqtt:server': '',
        'mqtt:port': '',
        'mqtt:user': '',
        'mqtt:pass': '',
        'wifi:ssid': '',
        'wifi:password': '',
      };
    }
    this.add.emit(profileDetails);
  }
}
