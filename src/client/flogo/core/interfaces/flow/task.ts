import { FLOGO_TASK_TYPE } from 'flogo/core/constants';
import { TaskAttributes } from './attribute';
import { AttributeMapping } from './attribute-mapping';
import { Link } from './link';

export interface Task {
  id: string;
  type: FLOGO_TASK_TYPE;
  version ?: string;
  name ?: string;
  activityRef?: string;
  flowRef?: string;
  ref ?: string;
  description ?: string;
  activityType?: string;
  triggerType?: string;
  attributes ?: TaskAttributes;
  inputMappings ?: AttributeMapping[ ];
  outputMappings ?: AttributeMapping[ ];
  tasks ?: Task[ ];
  links ?: Link[ ];
  settings?: {
    iterate?: string;
  };
  condition?: string;
  __props?: {
    [key: string]: any;
    errors?: { msg: string; }[];
    warnings?: { msg: string; }[];
  }; // internal only properties in design time
  __status?: {
    [key: string]: boolean;
  }; // internal only properties in design time
}
