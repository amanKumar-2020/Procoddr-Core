# Node.js — Variables, Scope, Global Object & CommonJS Modules

> Personal notes from learning Node.js module systems and variable scope.

---

## 1. Why Does `const num = 32` Show as a Local Variable?

Consider:

```js
const num = 32;

console.log(num);
```

In Node.js using **CommonJS**, every JavaScript file is treated as a separate module.

Node internally wraps the file in a function similar to:

```js
(function (exports, require, module, __filename, __dirname) {
    const num = 32;
});
```

Because `num` is declared inside this function, it belongs to that module's scope.

Therefore, the VS Code debugger shows:

```text
Local
└── num = 32
```

### Important

`const` itself does **not** mean "local".

The variable is local because of **where it is declared**.

For example:

```js
function test() {
    const num = 32;
}
```

Here `num` is local to `test()`.

---

# 2. Node.js CommonJS Module Wrapper

Node.js provides several variables automatically to every CommonJS module:

```js
exports;
require;
module;
__filename;
__dirname;
```

Conceptually:

```js
(function (exports, require, module, __filename, __dirname) {
    // Our code
});
```

This is why the VS Code debugger can show:

```text
exports = {}
module = Module {...}
__filename = ...
__dirname = ...
```

Even though we never explicitly declared them.

Node provides them as part of the CommonJS module system.

---

# 3. Why Is `exports` Empty?

If our file contains:

```js
const num = 32;
```

we have not exported anything.

Therefore:

```js
exports;
```

is initially:

```js
{
}
```

This is completely normal.

It does **not** mean that we accidentally exported something.

Node creates the `exports` object automatically because it is part of the CommonJS module system.

---

# 4. `exports` and `module.exports`

Initially:

```js
exports === module.exports;
```

Both refer to the same object.

For example:

```js
exports.num = 32;
```

adds a property:

```text
exports
└── num: 32
```

You can also write:

```js
module.exports.num = 32;
```

Both work because they initially reference the same object.

---

# 5. Exporting Something from a Module

Example:

### `app.js`

```js
const num = 32;

module.exports = num;
```

Another file can import it:

### `test.js`

```js
const num = require("./app");

console.log(num);
```

Output:

```text
32
```

The idea is:

```text
app.js
   │
   │ module.exports
   ▼
  32
   │
   │ require()
   ▼
test.js
```

This is the normal way to share data between CommonJS modules.

---

# 6. Local Variable vs Global Variable

Consider:

```js
const num = 32;
```

This creates a variable inside the current module.

It does **not** create:

```js
global.num;
```

So conceptually:

```text
Node.js Process
│
├── Global Object
│
└── Current Module
    └── num = 32
```

This is why `num` is shown under **Local** in the debugger.

---

# 7. Creating a Global Variable with `global`

Node.js provides the `global` object.

You can add a property to it:

```js
global.num2 = 43;
```

Now:

```js
console.log(global.num2);
```

prints:

```text
43
```

The global object can be thought of as:

```text
global
│
├── console
├── setTimeout
├── setInterval
├── process
├── Buffer
└── num2 = 43
```

We added `num2` to it.

---

# 8. Why Can We Sometimes Access `num2` Without `global.`?

After:

```js
global.num2 = 43;
```

Node's global environment can resolve the identifier:

```js
console.log(num2);
```

So it may work similarly to:

```js
console.log(global.num2);
```

However, explicitly writing:

```js
global.num2;
```

makes it clear that we are accessing a global property.

---

# 9. Can We Create a Global Variable Without `global`?

You may see code like:

```js
num = 32;
```

In non-strict CommonJS code, assigning to an undeclared identifier can create a property on the global object.

Conceptually, it can behave like:

```js
global.num = 32;
```

But **DO NOT use this approach**.

It is bad practice because:

- It creates accidental globals.
- It makes code difficult to understand.
- It can cause naming conflicts.
- It behaves differently in strict mode.
- It makes debugging harder.

With strict mode:

```js
"use strict";

num = 32;
```

results in:

```text
ReferenceError: num is not defined
```

### Rule

Never intentionally create globals by omitting `const`, `let`, or `var`.

---

# 10. `globalThis`

Modern JavaScript provides:

```js
globalThis;
```

It is the standard way to access the global object.

In Node.js:

```js
globalThis.num = 32;
```

Then:

```js
console.log(globalThis.num);
```

prints:

```text
32
```

Node.js also provides:

```js
global;
```

So you will commonly see:

```js
global.num = 32;
```

or:

```js
globalThis.num = 32;
```

---

# 11. Global Variables vs Module Exports

There are two very different approaches.

### Global

```js
global.num = 32;
```

This puts the value on the global object.

### Module export

```js
const num = 32;

module.exports = num;
```

Then another file can use:

```js
const num = require("./app");
```

### Prefer modules

For normal application development, prefer:

```text
module.exports
        ↓
      require()
```

instead of:

```text
global
```

---

# 12. Why Modules Are Better Than Globals

Imagine a large project:

```text
project/
├── app.js
├── user.js
├── product.js
├── auth.js
└── database.js
```

If everything is global, any file could potentially depend on global variables.

This creates hidden dependencies:

```text
auth.js ──────┐
              │
user.js ──────┼──→ global variables
              │
product.js ───┘
```

This makes the application harder to maintain.

With modules:

```text
database.js
     │
     │ export
     ▼
  auth.js
     │
     │ export
     ▼
  app.js
```

Dependencies become explicit.

---

# 13. Simple Mental Model

Remember this:

```text
                 Node.js Process
                       │
          ┌────────────┴────────────┐
          │                         │
     Global Object              Modules
          │                         │
       global                  app.js
          │                    user.js
       globalThis              auth.js
                                    │
                              local variables
```

A variable declared with:

```js
const
let
var
```

inside a CommonJS module belongs to that module's scope.

A property created with:

```js
global.something;
```

belongs to the global object.

A value assigned to:

```js
module.exports;
```

is exposed to other modules.

---

# 14. Quick Comparison

| Code                   | Meaning                          |
| ---------------------- | -------------------------------- |
| `const num = 32`       | Local/module variable            |
| `let num = 32`         | Local/module variable            |
| `var num = 32`         | Module-scoped in CommonJS        |
| `global.num = 32`      | Property on Node's global object |
| `globalThis.num = 32`  | Property on the global object    |
| `module.exports = num` | Export value from current module |
| `exports.num = 32`     | Export `num` property            |
| `require("./app")`     | Import another CommonJS module   |

---

# 15. Most Important Things to Remember

### ① Every CommonJS file is a module

```js
app.js;
```

has its own scope.

### ② Node provides a module wrapper

Conceptually:

```js
(function (exports, require, module, __filename, __dirname) {
    // your code
});
```

### ③ `const`, `let`, and `var` don't automatically create globals

```js
const num = 32;
```

is a module variable.

### ④ `global` represents Node's global object

```js
global.num = 32;
```

creates a global property.

### ⑤ Avoid unnecessary globals

Prefer:

```js
module.exports;
```

and:

```js
require();
```

for sharing data between files.

### ⑥ `exports = {}` in the debugger is normal

Node creates the `exports` object automatically.

It doesn't mean you exported something.

---

# 16. Final Mental Picture

```text
                     Node.js
                       │
                       ▼
               ┌───────────────┐
               │ Global Object  │
               │               │
               │ globalThis    │
               │ global        │
               │ console       │
               │ process       │
               └───────────────┘
                       │
                       │
              ┌────────┴────────┐
              │                 │
           module A          module B
           app.js            test.js
              │                 │
       const num = 32      require("./app")
              │                 │
              │                 │
              └── module.exports
                       │
                       ▼
                    shared
                     value
```

## Golden Rule

> **Use local/module variables by default. Use `module.exports` + `require()` to share things between CommonJS modules. Use `global` only when you genuinely need process-wide global state.**
