/* @flow */

// basic
// -----

function add(num1: number, num2: number): number {
  return num1 + num2;
}

var x: number = add(3, '0');

function foo(a: string, b: number): void {
  return a + b;
}
class Bar {
  y: string;
  someMethod(a: number): string {
    return a + foo('lorem', a);
  }
}

// maybe types
// -----------

var o: ?string = null;

// arrays
// ------

var a = [1, 2, 3];
var b: Array<number> = a.map(x => x + 1);

// union types
// -----------

var x: number | string = 0;

