# Client application coding guidelines

A style guide for syntax, conventions, and structuring Angular applications

### Style Guides for Reference

Refer to the following style guides if need be:

- [JavaScript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
- [HTML/CSS Style Guide](https://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml)
- [Angular Style Guide](https://angular.io/guide/styleguide)

## Guidelines for Developers

### Javascript

Client code mostly follows the official [Angular Style Guide](https://angular.io/guide/styleguide). Additional
considerations are detailed below.

#### One component, directive, service, filter... per file, and add meaningful suffix.

**Valid Suffix**

1. component
2. directive
3. service
4. pipe
5. spec
6. lang
7. e2e
8. interface
9. model

When you define class, you also need to add `Component`, `Directive`... as suffix

#### Unit and Integration tests

Read [angular's official testing guide](https://angular.io/guide/testing) and about the [different types of testing](https://vsavkin.com/three-ways-to-test-angular-2-components-dcea8e90bd8d).

DO NOT import the TranslateModule directly, instead use the [language testing utilities](/flogo/core/language/testing) under `@flogo-web/client/core/language/testing`.

## Reference

1. [https://mgechev.github.io/angular2-style-guide/](https://mgechev.github.io/angular2-style-guide/)
2. [Angular Style Guide](https://angular.io/guide/styleguide)
