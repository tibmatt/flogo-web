# Third party libraries for client app

Flogo app has two kinds of third party libraries, those that [SystemJs](https://github.com/systemjs/systemjs) is aware of and those it is not.

SystemJS needs to be aware of the libraries that are included in the javascript through import or require statements such as:

```javascript
import { Component } from '@angular/core';
```

SystemJS does not need to be aware of those used from the global object, for example jQuery which is directly used in the code without any imports.

This difference is important because for those loaded via import they need to be configured in systemjs config file which is located in `/src/client/systemjs.config.js`.

# Configuring new libraries

## Libraries not included via import/require (not managed by systemjs)

- Open `/gulp/config.js`
- Add the library javascript file(s) to `js` property of `CONFIG.libs`. This is for dev environment.
- Add the library minified javascript file(s) to `vendors` property of `CONFIG.libs.dist`. This is for prod environment.

## Libraries included via import/require (managed by systemjs)

This configuration will be different depending on the module format the library is provided (commonjs, amd, system, etc.),
see [SystemJs documentation](https://github.com/systemjs/systemjs) for more information.

For production these kind of libraries should be automatically found and bundled by _rollup_  and _angular-cli_ when building for production, but for development environment it may be required to add the library files via html script tags.

- Open `/src/client/systemjs.config.js` and add the configurations for your new library for both production and development environment.
- If required to manually load the library files into the app (via an html script tag) open `/gulp/config.js` and add the library file(s) to `js` property of `CONFIG.libs`.
