import {FLOGO_PROFILE_TYPE} from '../../constants';
import {deviceTaskIdGenerator} from './devices/task-id-generator';
import {microserviceTaskIdGenerator} from './microservices/task-id-generator';

export function taskIdGenerator(profile: FLOGO_PROFILE_TYPE): (items?: any, task?: any) => string {
  switch (profile) {
    case FLOGO_PROFILE_TYPE.DEVICE:
      return deviceTaskIdGenerator();
    case FLOGO_PROFILE_TYPE.MICRO_SERVICE:
    default:
      return microserviceTaskIdGenerator();
  }
}
