**Because Angular 2.0 not release, This is Draft version**

# Readme
A style guide for syntax, conventions, and structuring Angular applications 
  
##Required Libraries and Tools for Developers and QA   
You must have the following installed on your machine:
   
### Libraries   
The following libraries need to be available on your machines:   
- [Angular.js 2.x](https://angular.io)   
   
### Tools
- [NPM](https://www.npmjs.com/)
   
###Style Guides for Reference   
Refer to the following style guides if need be:

- [JavaScript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
- [HTML/CSS Style Guide](https://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml)
- [AngularJS 1.x Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
- [AngularJS 2.x Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a2/README.md)
	

## Guidelines for Developers   

### One component, directive, service, filter... per file, and add meaningful suffix.
**Valid Suffix**

1. component
2. directive
3. service
4. filter
5. spec
6. lang
7. e2e
8. interface
9. model
10. tpl

When you define class, you also need to add `Component`, `Directive`... as suffix

### A module folder example

```
app
    |-- components
        |-- app.component.ts
        |-- app.tpl.html
        |-- app.component.lang.json
        |-- app.component.css
        |-- app.component.spec.ts
        |-- app.component.e2e.ts
    |-- directives
        |-- app.directive.ts
        |-- app.directive.spec.ts
        |-- app.directive.e2e.ts
    |-- services
    |-- models
    
```

1. File name use lower case
2. If name more than one word, use - to connect them. For example `app-detail.component.ts`

### Avoid name collision, use module name as prefix, this rule for class name, directive name, selector name...

### Use attributes as selectors for directive, so one element can have multiple directives

### Use element as selectors for component.

### Selector naming rule. Element selector use `kebab-case`, attribute or class selector use `lowerCamelCase`

### Use `lowerCamelCase` for naming the selectors of your directives



## Reference

1. [https://mgechev.github.io/angular2-style-guide/](https://mgechev.github.io/angular2-style-guide/)
2. [Angular 2 Style Guide](https://github.com/johnpapa/angular-styleguide/tree/master/a2)
