# Engine interaction

Following documents how the flogo-web server interacts with the Flogo CLI to create, inspect and run the engine.

There are two modes:

* [Microservices](#microsevices)
* [Devices](#devices)

## Microsevices

> :computer: Most of the code that deals with the engine management can be found at [src/server/modules/engine`](https://github.com/TIBCOSoftware/flogo-web/tree/master/src/server/modules/engine)

There's only one design time engine per flogo web instance. Flogo apps are not persisted into this engine, the flogo-web
has a database where it stores all the applications created and imported by the user. This is because for test-running a flow
the engine doesn't read the app.json in the file system, instead it loads it dynamically from the flow service.

To compile/build an app the app.json is required to be in the filesystem, for that a second engine project is created on-demand.

### When the engine project doesn't exist

The flogo-web server will try to find and existing engine in the file system, if it cannot find an engine then it will:

1.  [Create a new design engine](#1.-create-a-new-design-engine)
1.  [Install default contributions](#2.-install-default-contributions)

#### 1. Create a new design engine

By default the flogo-web server tries to find an engine project under `dist/local/engines/flogo-web` if not found it will
create a new one by running:

```bash
flogo create -f default-app.json -flv github.com/TIBCOSoftware/flogo-contrib/activity/log@master,github.com/TIBCOSoftware/flogo-lib/app/resource@master flogo-web
```

* [default-app.json](https://github.com/TIBCOSoftware/flogo-web/blob/master/src/server/config/default-flogo.json) is a
  flogo.json with the minimum properties required by the flogo-cli create command. It doesn't declare any activities or
  triggers to allow the next step to install all the default contributions.
* By default uses `@master` version to make sure the dev environment uses the latest code from flogo-lib and flogo-cli
* The library version can be controlled by setting the `FLOGO_LIB_VERSION` or the `FLOGO_WEB_LIB_VERSION` environment variable.
  Note that this only applies to engine creation and the engine will need to be re-created (i.e. deleted) to take the version changes.

> :point_right: To ensure reproducible builds the production build process in the CI/CD pipeline automatically
> assigns `FLOGO_LIB_VERSION` when a tagged version is being built. Ex. when building `v0.5.3` -flv parameter will be assigned to:
> `github.com/TIBCOSoftware/flogo-contrib/activity/log@v0.5.3,github.com/TIBCOSoftware/flogo-lib/app/resource@v0.5.3`.

#### 2. Install default contributions

Once the design engine is created the default activities and triggers are installed into the engine by running:

```bash
flogo install palette default-palette.json
```

The `default-palette.json` describes the contributions to be included by default in the engine. The development environment palette
is different than the palette that is installed in the production environment (the docker image).

During the production build the `default-palette.json` is replaced by another palette created dynamically based on
the activities and triggers that are available in the `flogo-contrib` repository.

The `default-palette.json` that has been checked into the repository and that is used for development is maintained manually.
This is because installing all the OSS contributions takes a long time which is undesirable during development. Also, not all contributions
are cross-platform compatible and given the variety of operating systems that the development team uses we need to make sure that
the development palette can be used in windows, linux and macOS.

### Every time the app starts

When the server application starts and it can successfully find an instance of the engine in the file system the server will:

1.  Runs `flogo build` from inside the `<engine>` directory (by default `dist/server/local/engines/flogo-web`)
2.  Starts the compiled binary under `<engine>/bin-test` directory. It sets the following variables `FLOGO_LOG_LEVEL='DEBUG'`
    `TESTER_ENABLED='true'` and also sets `TESTER_PORT` and `TESTER_SR_SERVER` based on the current app configuration. Then
    with that configuration issues the command:


```bash
flogo build
```

1.  Runs `flogo list -json` and based on the activities and triggers listed by that command it find their corresponding descriptors
    under `<engine>/src/vendor/<engine>` and loads them into the UI database.

### Activity/trigger installation once the engine is created

1.  If activity/trigger is already installed it runs `flogo uninstall <ref>` where "ref" was provided by the user
2.  Runs `flogo install <ref>`
3.  Runs `flogo build` from inside the `<engine>` directory
4.  Kill previous engine process running instance, and starts the new generated binary as explained in the previous section.

### When you want to get the binary for an app

1.  It serializes the application that the user wants to build and outputs it to a `flogo.json` file in a temporal location.
2.  Runs


```bash
flogo create -f <path-to-temp-flogo.json> -vendor <path-to-flogo-design-engine/src/vendor -flv <same as create step> engine-build
```

* vendor option allows to reuse the vendor directory of the existing design engine (`engines/flogo-web`), this way the engine creation
  is faster as it doesn't require any additional network calls.
* for now and while [flogo-cli#88](https://github.com/TIBCOSoftware/flogo-cli/issues/88) is resolved we need to specicy the same
  `flv` value as the one used during the design engine creation.

3.  From the generated directory runs: `flogo build -e -o`. Those options will embed the app.json and remove any contributions
    that are not being referenced by the app to make the binary as lightweight as possible.
4.  For the previous step, if a target OS and architecture were defined then the environment variables `GOOS` and `GOARCH` will be
    passed to the `flogo build` command to build for the specified target. `flogo build` outputs the generated binary in a different location depending on the target operating system (`GOOS`) and architecture (`GOARCH`)
    specified by the user. If no target specified then the binary is located under `<engine>/bin/<binary>` where binary has the same name as the engine.
    If a target was specified then the binary can be found at `<engine>/bin/<GOOS>_<GOARCH>/<binary>`. Additionally if `GOOS='windows'` the binary
    will have an `.exe` extension.

## Devices

For the device profile the flogo-cli specifies a different command than for the microservice profile. While for microservices
the command is just `flogo`, for devices it is `flogodevice`. The device contributions (activities and triggers) are not compatible
with the regular flogo engine and they cannot be installed into one.

However, since the UI does not support running nor compiling device apps then it does not need to use the `flogodevice`
command and it does not need to generate or interact with any engine in the filesystem. Instead, the json descriptors for
activities and triggers are just loaded into the flogo web database directly from Github.

The device contributions that are installed by default are defined in [`src/server/config/default-devices-contrib.json`](https://github.com/TIBCOSoftware/flogo-web/blob/master/src/server/config/default-devices-contrib.json)
as mentioned before they activity.json or trigger.json is fetched directly from Github and that happens when the server application is initialized.
The code that handles the load/init is located in [src/server/modules/init/install-device-contribs.js](https://github.com/TIBCOSoftware/flogo-web/blob/master/src/server/modules/init/install-device-contribs.js)
