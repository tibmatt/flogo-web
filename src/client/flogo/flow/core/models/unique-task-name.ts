import {reduce, toInteger} from 'lodash';
import {normalizeTaskName} from '@flogo/shared/utils';
import {FLOGO_TASK_TYPE} from '@flogo/core';

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

export function hasTaskWithSameName(taskName, ...taskDictionaries): Boolean {
  const allTasks = Object.assign({}, ...taskDictionaries);
  // The branch type of items are exempted while finding the unique name
  return !!Object.keys(allTasks).find(taskID => allTasks[taskID].type !== FLOGO_TASK_TYPE.TASK_BRANCH
    && (allTasks[taskID].name).toLowerCase() === taskName.toLowerCase());
}
