import { microserviceTaskIdGenerator } from './microservices/task-id-generator';

export function taskIdGenerator(items?: any, currentTask?: any): string {
  return microserviceTaskIdGenerator(items, currentTask);
}
