# esformatter-flow

[esformatter](https://github.com/millermedeiros/esformatter) plugin to format
[Flow type annotations](http://flowtype.org/)

**IMPORTANT:** This plugin requires a parser that is able to handle Flow types
(eg. [Babylon](https://www.npmjs.com/package/babylon)); So it will only work
with `esformatter@0.9.0` and up.

## usage

Install the plugin:

```sh
npm install esformatter-flow
```

Add to your esformatter config file:

```json
{
  "plugins": [
    "esformatter-flow"
  ]
}
```

Or you can manually register the plugin if not using the `esformatter` command
directly:

```js
// register plugin
esformatter.register(require('esformatter-flow'));
```

Or even pass it as a command line argument:

```sh
esformatter --plugins=esformatter-flow,some-other-plugin 'foo.js'
```

## example

Given this input program:

```js
/* @flow */
function foo( a : string , b  : number)  : void {
  return a + b;
}
class Bar {
    y : string ;
  someMethod( a :number ): string {
  return a + foo('lorem', a);
  }
}
```

It will output:

```js
/* @flow */
function foo(a: string, b: number): void {
  return a + b;
}
class Bar {
  y: string;
  someMethod(a: number): string {
    return a + foo('lorem', a);
  }
}
```

See files inside the `test/compare` folder for more examples of the supported
features.

## license

Released under the MIT License
