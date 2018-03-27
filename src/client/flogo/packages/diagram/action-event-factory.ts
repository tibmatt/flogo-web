import { DiagramActionType } from './interfaces';
import { DiagramActionChild, DiagramActionSelf } from '@flogo/packages/diagram/interfaces';

export const actionEventFactory = {
  insert(parentId: string): DiagramActionChild {
    return {
      type: DiagramActionType.Insert,
      parentId,
    };
  },
  branch(parentId: string): DiagramActionChild {
    return {
      type: DiagramActionType.Branch,
      parentId,
    };
  },
  select(id: string): DiagramActionSelf {
    return {
      type: DiagramActionType.Select,
      id,
    };
  },
  configure(id: string): DiagramActionSelf {
    return {
      type: DiagramActionType.Configure,
      id,
    };
  },
  remove(id: string): DiagramActionSelf {
    return {
      type: DiagramActionType.Remove,
      id,
    };
  },
};
