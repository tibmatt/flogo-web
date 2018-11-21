import {FLOGO_PROFILE_TYPES} from "../constants";

export function getProfileType(app) {
  if(app.device){
    return FLOGO_PROFILE_TYPES.DEVICE;
  } else {
    return FLOGO_PROFILE_TYPES.MICRO_SERVICE;
  }
}
