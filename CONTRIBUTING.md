# Contributing

## About the architecture

Most of the code is written using Typescript, the [official Typescript documentation](https://www.typescriptlang.org/docs/home.html) is a good resource to learn about it.

The Flogo Web UI follows a regular client-server model and as such it is divided into two principal components: the server and the client.

The server application (located under [`/apps/server`](/apps/server)) is a NodeJs application. Besides persisting data, the server application wraps the [Flogo CLI](https://github.com/project-flogo/cli) to interact with and underlying Flogo engine project and exposes its functionality to the client application.

The client application (located under [`/apps/client`](/apps/client)) is implemented using the [Angular](https://angular.io/) framework and provides a broswer based UI to design Flogo applications.

Communication between server and client is mostly done through a REST API exposed by the server.

You can find more information in the [application docs](/docs) like an explanation of the
[directory structure](./libs/). Also there's more information in the README file of the server and client apps.

## Server Environment

Before starting the server copy and rename the [`.env.example`](/.env.example) to `.env`. Add or modify/uncomment
the environment variables defined in created `.env` file.

You can alternatively set regular environment variables the way your OS supports them.

## Testing

### Before running the tests

Make sure your dependencies are up to date:

```sh
yarn install
```

### Running the tests

From the project root:

```sh
yarn test
```

This will run the unit test for all the sub packages.

### Running tests for a single subpackage

From the project root:

```sh
yarn test <name-of-the-package>
```

For example

```sh
yarn test parser
```

## Style guide and code conventions

### Code formatting

Flogo Web uses [Prettier](https://prettier.io/) for code formatting which will automatically format javascript, typescript, css, html and markdown files.

The easiest way to format your code is directly in your code editor, refer to [Prettier's documentation for Editor Integration](https://prettier.io/docs/en/editors.html) for
an explanation of how to set them up.

Alternatively you can run the `format` script which will format, to all files in the project:

```bash
yarn format
```

## Other tasks

All the commands listed in the following subsections are specified as `<command>: description` and they can be run from
the root of the project as:

```sh
yarn run <command>
```

### Managing engine/local data

- `clean:local`: Clean ALL your local data. This will remove the engine, database and logs.
- `clean:engines`: Remove the local engines only. This will force the server to rebuild the engine on next startup.

### Misc

- `update-global-flogo`: Update global flogo-cli to the latest available

Flogo Web uses npm/yarn scripts for its build process. Take a look at README.md of the packages as well as at the scripts section
in the `package.json` of the root project and the subpackages to find other commands available.
