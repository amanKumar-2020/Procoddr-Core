# Custom `require()` Function — Understanding CommonJS Modules

## 1. The Idea

Node.js provides CommonJS module functionality through:

```js
const math = require("./math.js");
```

I created a simplified custom version of this idea to understand how it works internally.

My custom function:

```js
const math = loadModule("./math.js");
```

The goal is to:

1. Read a JavaScript file.
2. Execute its code.
3. Give the file an object to attach exports to.
4. Return that object to the caller.

---

## 2. Basic Custom Module Loader

```js
const fs = require("fs");

function loadModule(path) {
    const fileContent = fs.readFileSync(path, "utf-8");

    return (function (exports) {
        eval(fileContent);
        return exports;
    })({});
}
```

Usage:

```js
const math = loadModule("./math.js");

console.log(math);
```

---

## 3. The `math.js` File

`math.js`:

```js
exports.a = 34;
console.log("here in math.js file");
```

When this file is loaded:

```js
const math = loadModule("./math.js");
```

the custom loader creates an empty object:

```js
{
}
```

and passes it into the IIFE:

```js
(function (exports) {
    // math.js executes here
})({});
```

Inside `math.js`:

```js
exports.a = 34;
```

The object becomes:

```js
{
    a: 34;
}
```

The loader then returns that object:

```js
return exports;
```

Therefore:

```js
console.log(math);
```

outputs:

```text
{ a: 34 }
```

---

## 4. Why `eval(fileContent)` Alone Returned `undefined`

Initially, the loader looked like this:

```js
return (function (send) {
    console.log("Hello from IIFE!");
    return eval(fileContent);
})({});
```

And `math.js` was:

```js
send.a = 34;
console.log("here in math.js file");
```

The result was:

```text
Hello from IIFE!
here in math.js file
undefined
```

### Why?

`eval()` returns the value of the evaluated JavaScript expression.

The last statement in `math.js` was:

```js
console.log("here in math.js file");
```

`console.log()` returns:

```js
undefined;
```

Therefore:

```js
eval(fileContent);
```

returned:

```js
undefined;
```

So this:

```js
return eval(fileContent);
```

also returned:

```js
undefined;
```

---

## 5. The Important Difference

Instead of returning the result of `eval()`:

```js
return eval(fileContent);
```

we execute the file first:

```js
eval(fileContent);
```

and then return the object:

```js
return exports;
```

So:

```js
function loadModule(path) {
    const fs = require("fs");
    const fileContent = fs.readFileSync(path, "utf-8");

    return (function (exports) {
        eval(fileContent);
        return exports;
    })({});
}
```

This is the important concept:

```text
Read file
   ↓
Create exports object
   ↓
Execute module code
   ↓
Module modifies exports
   ↓
Return exports
```

---

## 6. Why Use an IIFE?

The IIFE:

```js
(function (exports) {
    eval(fileContent);
    return exports;
})({});
```

creates a function scope for the module.

The object:

```js
{
}
```

is passed as:

```js
exports;
```

So conceptually, the module is executed like:

```js
(function (exports) {
    // contents of math.js
})({});
```

This is similar to the idea behind Node.js wrapping CommonJS modules in a function.

---

## 7. `send` vs `exports`

Originally I used:

```js
(function (send) {
```

and in `math.js`:

```js
send.a = 34;
```

This works.

But the more meaningful name is:

```js
(function (exports) {
```

and:

```js
exports.a = 34;
```

because CommonJS uses the concept of an `exports` object.

So prefer:

```js
function loadModule(path) {
    const fs = require("fs");
    const fileContent = fs.readFileSync(path, "utf-8");

    return (function (exports) {
        eval(fileContent);
        return exports;
    })({});
}
```

---

## 8. Mental Model

Think of:

```js
const math = loadModule("./math.js");
```

as:

```text
                    loadModule()
                         │
                         ▼
                 Read math.js
                         │
                         ▼
                  Create {}
                         │
                         ▼
              Pass object as exports
                         │
                         ▼
              Execute math.js code
                         │
                         ▼
                 exports.a = 34
                         │
                         ▼
                  { a: 34 }
                         │
                         ▼
                  return exports
                         │
                         ▼
                    math variable
```

So:

```js
math.a;
```

is:

```text
34
```

---

## 9. Connection to CommonJS

This experiment helps explain the basic idea behind:

```js
const math = require("./math.js");
```

and:

```js
exports.a = 34;
```

Node's CommonJS system provides module-related objects and executes the module inside a function wrapper.

A simplified mental model is:

```js
(function (exports, require, module, __filename, __dirname) {
    // module code
});
```

This is not the complete implementation of Node's loader, but it is a useful model for understanding it.

---

## 10. `exports` and `module.exports`

An important next concept:

```js
exports.a = 34;
```

is commonly used for adding properties.

But:

```js
module.exports = {
    a: 34,
};
```

replaces what the module exports.

This is why understanding the relationship between:

```js
exports;
```

and:

```js
module.exports;
```

is important when learning CommonJS.

---

## 11. Current Custom Loader

The version I built:

```js
const fs = require("fs");

function loadModule(path) {
    const fileContent = fs.readFileSync(path, "utf-8");

    return (function (exports) {
        eval(fileContent);
        return exports;
    })({});
}
```

Example:

### `math.js`

```js
exports.a = 34;
exports.add = (a, b) => a + b;
```

### `app.js`

```js
const math = loadModule("./math.js");

console.log(math);
console.log(math.a);
console.log(math.add(10, 20));
```

Output:

```text
{
    a: 34,
    add: [Function]
}

34
30
```

---

## 12. What This Experiment Taught Me

### Key points

- `require()` loads another module.
- A module needs a way to expose values.
- An `exports` object can be used for this.
- The module code modifies that object.
- The loader returns the exported object.
- `eval()` executes JavaScript code dynamically.
- `eval()` returns the value of the evaluated code, which is not necessarily the exports object.
- An IIFE can create a private scope for the module.
- This experiment gives a simplified mental model of CommonJS.

### Most important idea

```js
exports.a = 34;
```

means:

> "Put `a` on the object that the module system will eventually return."

And:

```js
const math = require("./math.js");
```

means conceptually:

> "Load and execute the module, then give me what that module exported."

---

## 13. Next Things to Learn

After understanding this custom loader, the next useful concepts are:

1. `module.exports`
2. `exports` vs `module.exports`
3. Custom `require()`
4. Module caching
5. Resolving relative paths
6. `__filename`
7. `__dirname`
8. Node's CommonJS module wrapper
9. How Node resolves modules
10. Difference between CommonJS and ES Modules

---

> **Note:** This custom loader is for learning. Using `eval()` on arbitrary files is unsafe in real applications because it executes the file's JavaScript code directly.
