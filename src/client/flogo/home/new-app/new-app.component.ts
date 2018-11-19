import {Component, HostBinding} from '@angular/core';
import {ProfilesAPIService} from '../../core/services/restapi/v2/profiles-api.service';
import {FLOGO_PROFILE_TYPE} from '@flogo/core';
import {modalAnimate, ModalControl} from '@flogo/core/modal';

interface DeviceProfile {
  type: string;
  id: string;
}

@Component({
  selector: 'flogo-home-new-app',
  templateUrl: 'new-app.component.html',
  styleUrls: ['new-app.component.less'],
  animations: modalAnimate
})
export class FlogoNewAppComponent {
  @HostBinding('@modalAnimate')
  FLOGO_PROFILE_TYPE: typeof FLOGO_PROFILE_TYPE = FLOGO_PROFILE_TYPE;

  constructor(public control: ModalControl) {
  }

  onAddProfile(profileType: FLOGO_PROFILE_TYPE, profile?: string) {
    const profileDetails: any = {profileType};
    if (profileType === FLOGO_PROFILE_TYPE.DEVICE) {
      profileDetails.profile = 'github.com/TIBCOSoftware/flogo-contrib/device/profile/feather_m0_wifi';
      profileDetails.deviceType = profile;
      profileDetails.settings = {
        'mqtt:server': '',
        'mqtt:port': '',
        'mqtt:user': '',
        'mqtt:pass': '',
        'wifi:ssid': '',
        'wifi:password': ''
      };
    }
    this.control.close(profileDetails);
  }
}
