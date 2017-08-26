import {Injectable} from "@angular/core";
import {ProfilesAPIService} from "./profiles-api.service";

@Injectable()
export class MockProfilesAPIService extends ProfilesAPIService {

  sampleApps = [
    {
      type: "Atmel AVR",
      id: "ATMEL-AVR"
    },
    {
      type: "Atmel SAM",
      id: "ATMEL-SAM"
    },
    {
      type: "Espressif 32",
      id: "ESPRESSIF-32"
    }
  ];

  constructor() {
    super(null, null);
  }

  getProfilesList() {
    return Promise.resolve(this.sampleApps);
  }
}
