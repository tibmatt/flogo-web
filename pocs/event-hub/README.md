Event Hub
-------

Event Hub is a Pub/Sub service, which automatically fires events/messages of the life cycle of an operation (start/processing/done/error).

Built on the top of [Postal](https://github.com/postaljs/postal.js).

Documentations are in `doc/` folder.

__Table of Contents__

<!-- MarkdownTOC -->

- [Initialise](#initialise)
- [Build](#build)
- [Clean](#clean)
- [Test](#test)
- [Example](#example)

<!-- /MarkdownTOC -->

<a name="initialise"></a>
## Initialise

```bash
# Have Node 6.x & NPM 3.x installed

# install dependencies
npm install
```

<a name="build"></a>
## Build

```bash
# generate production code
# note that no minified version provided
npm run prod

# remove the built code
npm run clean
```

<a name="clean"></a>
## Clean

```bash
# remove the built code only
npm run clean

# remove the built code and node modules
npm run reset
```

<a name="test"></a>
## Test

```bash
npm run test
```

<a name="example"></a>
## Example

Compile the example and serve it.

```bash
npm run example
```
