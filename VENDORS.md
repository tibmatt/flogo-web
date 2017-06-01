# Third party dependencies change log
All notable changes to this project will be documented in this file.

## v0.4.0

### Root Development Dependencies
- Removed:
  - browser-sync
  - gulp-inject
  - gulp-inline-ng2-template
  - gulp-less
  - gulp-load-plugins
  - gulp-typescript
  - less
  - mustache
  - pouchdb-server
  - swagger-jsdoc
  - tslint (still referenced in client dependencies)
  - typescript (still referenced in client dependencies)
  
  
### Client Dependencies

#### Production
[No changes]

#### Development

- Added
  - [@angular/compiler@2.4.0](https://github.com/angular/angular) (MIT)
  - [@angular/cli@1.0.0](https://github.com/angular/angular-cli) (MIT)
  - [bootstrap-less@3.3.8]() ()
  - [codelyzer@2.0.0](https://github.com/mgechev/codelyzer) (MIT)
  - [jasmine-spec-reporter@3.2.0](https://github.com/bcaudan/jasmine-spec-reporter) (Apache-2.0)
  - [karma-coverage-istanbul-reporter@0.2.0](https://github.com/mattlewis92/karma-coverage-istanbul-reporter) (MIT)
  - [protractor@5.1.0](https://github.com/angular/protractor) (MIT)
  - [ts-node@2.0.0](https://github.com/TypeStrong/ts-node) (MIT)
  - [tslint@4.4.2](https://github.com/palantir/tslint) (Apache-2.0)
- Upgraded
  - [jasmine-core](https://github.com/jasmine/jasmine) from 2.4.1 to 2.5.2 (MIT)
  - [karma](https://github.com/karma-runner/karma) from 1.3.0 to 1.4.1 (MIT)
  - [karma-jasmine](https://github.com/karma-runner/karma-jasmine) from 1.0.2 to 1.1.0 (MIT)
- Removed
  - @types/core-js
  - rollup
  - rollup-plugin-commonjs
  - rollup-plugin-node-resolve
  - rollup-plugin-uglify

### Server Dependencies

#### Production

- Removed:
  - pouchdb
  - pouchdb-load
  - pouchdb-server

#### Development

- Removed:
  - pouchdb-dump-cli

## v0.3.4

[No changes]

## v0.3.3

### Root Development Dependencies
- Added:
  - [gulp-plumber@1.1.0](https://github.com/floatdrop/gulp-plumber/tree/v1.1.0) (MIT)

### Client Dependencies

#### Production

[No changes]

#### Development

[No changes]

### Server Dependencies

#### Production

- Added:
  - [ajv@4.11.5](https://github.com/epoberezkin/ajv/tree/4.11.0) (MIT)
  - [nedb@1.8.0](https://github.com/louischatriot/nedb/tree/v1.6.0) (MIT)
  - [shortid@2.2.8](https://github.com/dylang/shortid/tree/2.2.8) (MIT)

#### Development

- Added:
  - [chai@3.5.0](https://github.com/chaijs/chai/tree/3.5.0) (MIT)
  - [chai-http@3.0.0](https://github.com/chaijs/chai-http/tree/3.0.0) (MIT)
  - [mocha@3.2.0](https://github.com/mochajs/mocha/tree/v3.2.0) (MIT)
  - [server-destroy@1.0.1](https://github.com/isaacs/server-destroy/tree/v1.0.1) (MIT)
