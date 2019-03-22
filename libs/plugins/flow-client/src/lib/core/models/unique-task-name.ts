import { reduce, toInteger } from 'lodash';
import { FLOGO_TASK_TYPE, ItemTask } from '@flogo-web/client/core';
import { normalizeTaskName } from '@flogo-web/client/common';

const isBranchTask = task => task.type === FLOGO_TASK_TYPE.TASK_BRANCH;

export function uniqueTaskName(taskName: string, ...taskDictionaries) {
  // TODO for performance pre-normalize and store task names?
  const newNormalizedName = normalizeTaskName(taskName);

  const allTasks = Object.assign({}, ...taskDictionaries);

  // search for the greatest index in all the flow
  const greatestIndex = reduce(
    allTasks,
    (greatest: number, task: any) => {
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
    },
    0
  );

  return greatestIndex > 0 ? `${taskName} (${greatestIndex + 1})` : taskName;
}

export function hasTaskWithSameName(taskName, ...taskDictionaries): boolean {
  const allTasks = Object.assign({}, ...taskDictionaries);
  return !!Object.values(allTasks).find(
    task =>
      !isBranchTask(task) &&
      (task as ItemTask).name.toLowerCase() === taskName.toLowerCase()
  );
}
