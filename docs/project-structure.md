# Project Directory Structure

- `/libs` Independent and reusable modules/packages
- `/apps` Deployable apps which integrate and compose the modules and libs. Currently there are only two apps: server (backend) and client (frontend).
- `/docs` Developer documentation regarding project structure and code guidelines and conventions.
- `/tools` Building and release related scripts.
- `/dist` Contains local data (engine instance, database files) and compiled/transpiled code.

## About the project architecture

The Flogo Web project follows a monorepo approach and it is composed of several subpackages.

> :books: You might want to look at [some pros and cons of monorepos](https://github.com/babel/babel/blob/master/doc/design/monorepo.md).

For this the project leverages [@angular/cli](https://cli.angular.io/) and [Nx](https://nrwl.io/nx/overview).
It is advised for contributors of this project to become familiar with these tools so they can take advantage of their features such as code generation and dependency inspection.
