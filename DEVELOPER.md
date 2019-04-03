# Developer

## Running Tests Locally

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
yarn test server
```

## Customize the server environment

Before starting the server copy and rename the [`.env.example`](/.env.example) to `.env`. Add or modify/uncomment
the environment variables defined in created `.env` file.

You can alternatively set regular environment variables the way your OS supports them.

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
