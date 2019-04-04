# Project Directory Structure

- `/libs` Independent and reusable modules/packages
- `/apps` Deployable apps which integrate and compose the modules and libs. Currently there are only two apps: server (backend) and client (frontend).
- `/docs` Developer documentation regarding project structure and code guidelines and conventions.
- `/tools` Build and release related scripts.
- `/dist` Contains local data (engine instance, database files) and compiled/transpiled code.

## About the project architecture

The Flogo Web project follows a monorepo approach and it is composed of several subpackages.

> :books: You might want to look at [some pros and cons of monorepos](https://github.com/babel/babel/blob/master/doc/design/monorepo.md).

For this the project leverages [@angular/cli](https://cli.angular.io/) and [Nx](https://nrwl.io/nx/overview).
It is advised for contributors of this project to become familiar with these tools so they can take advantage of their features such as code generation and dependency inspection.

## Package conventions

There are three categories for packages residing under libs: client, server and universal libs.

Client libs should be used in client only, server libs should be used in server only and universal libs (or isomorphic libs)
can be used in both client and server, for that reason universal libs should not make any assumption about the environment they're running in
or depend on platform specific APIs (like browser DOM APIs or Node APIs).

This is a summary of the current packages:

- `/libs`
  - `assets`: universal lib, contains application assets like images and fonts (`@flogo-web/assets`)
  - `core`: universal lib, core logic and interfaces to be reused across the whole platform (`@flogo-web/core`)
  - `lib-client`: contains client specific packages, usually angular modules (`@flogo-web/lib-client/<subcomponent>`)
  - `lib-server`: contains server specific packages (`@flogo-web/lib-server/<subcomponent>`)
    <!-- TODO: link to mapping docs when available: https://github.com/project-flogo/core/blob/master/docs/mapping.md -->
  - `parser`: universal lib, can parse Flogo expressions used by the mapper module `@flogo-web/parser`
  - `plugins`: packages to extend the Flogo Web UI functionality and support different types of Flogo Actions
