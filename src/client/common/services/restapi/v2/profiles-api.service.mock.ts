import {Injectable} from "@angular/core";
import {ProfilesAPIService} from "./profiles-api.service";

@Injectable()
export class MockProfilesAPIService extends ProfilesAPIService {
  sampleApps = [
    {
      type: "Atmel AVR",
      i18nKey: "ATMEL-AVR"
    },
    {
      type: "Atmel SAM",
      i18nKey: "ATMEL-SAM"
    },
    {
      type: "Espressif 32",
      i18nKey: "ESPRESSIF-32"
    }
  ];

  getProfilesList() {
    return Promise.resolve(this.sampleApps);
  }
}
