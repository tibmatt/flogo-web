import { reduce, toInteger } from 'lodash';
import { normalizeTaskName } from '@flogo/shared/utils';

export function uniqueTaskName(taskName: string, ...taskDictionaries) {
  // TODO for performance pre-normalize and store task names?
  const newNormalizedName = normalizeTaskName(taskName);

  const allTasks = Object.assign({}, ...taskDictionaries);

  // search for the greatest index in all the flow
  const greatestIndex = reduce(allTasks, (greatest: number, task: any) => {
    const currentNormalized = normalizeTaskName(task.name);
    let repeatIndex = 0;
    if (newNormalizedName === currentNormalized) {
      repeatIndex = 1;
    } else {
      const match = /^(.*)\-([0-9]+)$/.exec(currentNormalized); // some-name-{{integer}}
      if (match && match[1] === newNormalizedName) {
        repeatIndex = toInteger(match[2]);
      }
    }

    return repeatIndex > greatest ? repeatIndex : greatest;

  }, 0);

  return greatestIndex > 0 ? `${taskName} (${greatestIndex + 1})` : taskName;
}

export function uniqueTaskNameValidator(taskName, ...taskDictionaries) {
  const allTasks = Object.assign({}, ...taskDictionaries);
  const itemIds = Object.keys(allTasks);
  return itemIds.find(itemId => normalizeTaskName(allTasks[itemId].name) === normalizeTaskName(taskName));
}
