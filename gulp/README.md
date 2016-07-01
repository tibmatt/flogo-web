## Adding new tasks
Add new tasks to `tasks` directory or subdirectory, they will be automatically loaded by main gulpfile.

`gulp-help` plugin is used to provide a help feature so you need to add the description when defining a new task, like this:

```javascript
  gulp.task(taskname, description, [])
```

This description will be displayed when running `gulp help`.

Conventions we're following:

- One task per file and file has the same name as the task it contains
- Tasks are namespaced using dots
- If task is in subfolder it should be namespaced with the container name. Example: `tasks/dev/sub/dev.sub.my-task.js` and `gulp.task('dev.sub.my-task')`
- Separate dev tasks from prod tasks (or any other env) in their own subfolders, tasks used by both can be placed in root `tasks` folder.

We've chosen to make an exception to the task per file convention for heavily related tasks with their subtasks, in that case filename is the same as main task.