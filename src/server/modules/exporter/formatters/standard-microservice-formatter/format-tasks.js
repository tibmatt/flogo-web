import { TaskFormatter } from './task-formatter';

export function formatTasks(tasks = []) {
  const taskFormatter = new TaskFormatter();
  return tasks.map(task => taskFormatter.setSourceTask(task).convert());
}
