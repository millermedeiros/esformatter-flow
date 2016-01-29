/* @flow */

// basic
// -----

function add(num1  :    number, num2:number) : number {
  return num1 + num2;
}

var x : number = add(3, '0');

function foo( a : string , b  : number)  : void {
  return a + b;
}
class Bar {
  y : string;
  someMethod(a :number): string {
  return a + foo('lorem', a);
  }
}

// maybe types
// -----------

var o :  ?  string = null;

// arrays
// ------

var a = [1, 2, 3];
var b: Array < number > = a.map(x => x + 1);

// union types
// -----------

var x: number|string = 0;

// intersection and FunctionTypeAnnotation
// ---------------------------------------

declare var f: (( x :  Foo  ) => void)&((x: Bar) => void);
var a : ()=>number;
var b : (  num:number ,isFoo : boolean)  =>  number;

// aliases
// -------

type T=number;
var x: T = 0;

// declarations
// ------------

declare class C{
  x: string;
}
declare module M  {
  declare function foo (c:C,d:D ) : void;
}

// ObjectTypeAnnotation
// --------------------

type Message = {
id:string ;
      text : string;
  foo: ? number;
};

function foo(): {
id: string ;
    text :string  ;
  foo: ?number;
}{
return bar;
}

function foo2(): { id:string ,text : string, foo : ?number }{
  return bar;
}

// ImportDeclaration
// -----------------

import type {  Foo  } from 'FoooBar';
import type { Foo, Bar , Baz } from 'FoooBar';
import  type  Dolor  from  'Dolor';
