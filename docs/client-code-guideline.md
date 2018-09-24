# Client application coding  guidelines
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


#### Using rxjs

There are few special considerations when using [rxjs](https://github.com/ReactiveX/rxjs) in flogo-web:

##### Do NOT import from `rxjs/Rx`

The RxJS library is large. Importing the `rxjs/Rx` package will import the whole RxJS library into the application,
this will result in increased page loading times as the application will be forced to download resources it is not going to use.

Instead, when you need to use of the RxJS library import directly from the `rxjs` module or its submodules, examples:

```typescript
// Correct, importing from each module 
import { Observable, BehaviorSubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
```

#### Avoid name collision, use module name as prefix, this rule for class name, directive name, selector name...

// TODO: example

#### Unit and Integration tests

Read [angular's official testing guide](https://angular.io/guide/testing) and about the [different types of testing](https://vsavkin.com/three-ways-to-test-angular-2-components-dcea8e90bd8d).

DO NOT import the TranslateModule directly, instead use the [language testing utilities](/flogo/core/language/testing) under `@flogo/core/language/testing`.

## Reference

1. [https://mgechev.github.io/angular2-style-guide/](https://mgechev.github.io/angular2-style-guide/)
2. [Angular Style Guide](https://angular.io/guide/styleguide)
