# Client application coding  guidelines
A style guide for syntax, conventions, and structuring Angular applications 
  
## Required Libraries and Tools for Developers and QA   
You must have the following installed on your machine:

### Tools
- [NPM](https://www.npmjs.com/)
- NodeJS v6.4.0 or greater
   
###Style Guides for Reference   
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

#### A module folder example

// TODO

#### Using rxjs

There are few special considerations when using [rxjs](https://github.com/ReactiveX/rxjs) in flogo-web:

##### Do NOT import from `rxjs/Rx`

The RxJS library is large. Importing the `rxjs/Rx` package will import the whole RxJS library into the application,
this will result in increased page loading times as the application will be forced to download resources it is not going to use.

Instead, when you need to use of the RxJS library import directly from the modules, examples:

```javascript
// Correct, importing from each module 
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
///

// WRONG, this will load the whole RxJS libray
import { Observable, BehaviorSubject } from 'rxjs/Rx';

```

##### Only add the operators you use

Each code file should add the operators it needs by importing from an RxJS library. Make sure you only add the operators you use,
as any added operators will be included in the final production bundle.

```js
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
```


#### The messaging mechanism and `messages.ts` file

Modules communicating through messaging mechanism using the `common/services/post.services.ts`, which is based on [`Postal`](https://www.npmjs.com/package/postal).

For the moment, considering decoupling, the solution is to implement a `messages.ts` within the module folder if the module need to communicate with the others through the message mechanism. The parent module will use the information of the `messages.ts` of its children modules to glue the children modules together.

In this case, development of the child module or the same level module could be independent. The one of the cons of this approach is that the parent module have to take responsibility to glue its children and pass the messages of its children modules.

##### Example of a `messages.ts`

```javascript
/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  addTask : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'add-task'
  }
};

/**
 * Events subscribed by this module
 */

export const SUB_EVENTS = {
  addTask : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'public-add-task'
    // , data: {
    //   task: {
    //     id: "task id",
    //     name: "task name",
    //     ...
    //   },
    //   ...
    // }
  }
};

```

___Note___ that the commented `data` field is used to provide an example of the required information of that message, and the `topic` field is prefixed with `public-`.


##### Example of usage

```typescript

/**
 * inside the child module
 * `this` is the class of the module
 */

// ...
  // subscribe incoming message
  this._postService.subscribe( _.assign( {}, SUB_EVENTS.addTask, { callback : this._addTaskDone.bind( this ) } ) )
  
  // publish the outgoing message
  this._postService.publish( _.assign( {}, PUB_EVENTS.addTask, { data : data } ) );
// ...

/**
 * inside the parent module
 * `this` is the class of the module
 */
 
// ...
  // subscribe message from child module
  this._postService.subscribe( _.assign( {}, PUB_EVENTS.addTask, { callback : this._addTaskFromChild.bind( this ) } ) )
  
  // do the magic
  
  // publish message to the child module
  this._postService.publish( _.assign( {}, SUB_EVENTS.addTask, { data : data } ) );
// ...


```



__TODO:__ in the future, new messaging mechanism will be introduced to replace this one.


#### Avoid name collision, use module name as prefix, this rule for class name, directive name, selector name...

// TODO: example

#### Unit and Integration tests

Read [angular's official testing guide](https://angular.io/guide/testing) and about the [different types of testing](https://vsavkin.com/three-ways-to-test-angular-2-components-dcea8e90bd8d).

DO NOT import the TranslateModule directly, instead use the [language testing utilities](/flogo/core/language/testing) under `@flogo/core/language/testing`.

## Reference

1. [https://mgechev.github.io/angular2-style-guide/](https://mgechev.github.io/angular2-style-guide/)
2. [Angular Style Guide](https://angular.io/guide/styleguide)
