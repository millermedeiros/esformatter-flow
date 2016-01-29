/* @flow */

// basic
// ----------------------------------------------
// http://flowtype.org/docs/type-annotations.html

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
// ----------------------------------------------
// http://flowtype.org/docs/nullable-types.html

var o :  ?  string = null;

// arrays
// ------------------------------------
// http://flowtype.org/docs/arrays.html

var a = [1, 2, 3];
var b: Array < number > = a.map(x => x + 1);

