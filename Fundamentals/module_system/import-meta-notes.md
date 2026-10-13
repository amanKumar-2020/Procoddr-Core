# `import.meta` in Node.js ES Modules (ESM)

## 1. What is `import.meta`?

When using **ES Modules**, Node.js provides every module with a special object called:

```js
import.meta
```

It contains metadata about the **current module**.

Example:

```js
console.log(import.meta);
```

Typical output:

```js
{
  dirname: <accessor>,
  filename: <accessor>,
  main: true,
  resolve: ƒ,
  url: 'file:///home/aman/Codebase/Procoddr-Core/Fundamentals/module_system/app.js'
}
```

Think of `import.meta` as:

> "Give me information about the current ES module."

---

## 2. `import.meta.url`

`import.meta.url` gives the URL of the current module.

```js
console.log(import.meta.url);
```

Example:

```text
file:///home/aman/Codebase/Procoddr-Core/Fundamentals/module_system/app.js
```

Notice that this is a **file URL**, not a normal Linux filesystem path.

### URL vs filesystem path

```text
import.meta.url
→ file:///home/aman/.../app.js

import.meta.filename
→ /home/aman/.../app.js
```

ES Modules are designed around URLs, which is why `import.meta.url` uses the `file://` scheme for local files.

---

## 3. `import.meta.filename`

`import.meta.filename` gives the filesystem path of the current module.

```js
console.log(import.meta.filename);
```

Example:

```text
/home/aman/Codebase/Procoddr-Core/Fundamentals/module_system/app.js
```

Mental model:

```text
url      → URL representation
filename → filesystem representation
```

---

## 4. `import.meta.dirname`

`import.meta.dirname` gives the directory containing the current module.

```js
console.log(import.meta.dirname);
```

Example:

```text
/home/aman/Codebase/Procoddr-Core/Fundamentals/module_system
```

For this file:

```text
/home/aman/Codebase/Procoddr-Core/Fundamentals/module_system/app.js
```

the directory is:

```text
/home/aman/Codebase/Procoddr-Core/Fundamentals/module_system
```

### Relation to CommonJS

CommonJS traditionally provides:

```js
__filename
__dirname
```

ES Modules provide:

```js
import.meta.filename
import.meta.dirname
```

So conceptually:

```text
CommonJS
    __filename
    __dirname

ESM
    import.meta.filename
    import.meta.dirname
```

---

## 5. `import.meta.main`

`import.meta.main` tells us whether the current module is the **entry point** of the Node.js application.

If you run:

```bash
node app.js
```

and `app.js` is the file Node started with:

```js
console.log(import.meta.main);
```

Output:

```text
true
```

### Example

Directory:

```text
project/
├── app.js
└── math.js
```

### `app.js`

```js
import "./math.js";

console.log(import.meta.main);
```

### `math.js`

```js
console.log(import.meta.main);
```

Run:

```bash
node app.js
```

Conceptually:

```text
math.js → false
app.js  → true
```

Why?

```text
app.js
  ↓
Node started here
  ↓
import.meta.main === true
```

while:

```text
math.js
  ↓
Imported by app.js
  ↓
import.meta.main === false
```

This is similar to the CommonJS pattern:

```js
require.main === module
```

---

## 6. `import.meta.resolve()`

`import.meta.resolve()` is a function used to resolve a module specifier.

It answers the question:

> "If I import this module from here, where would Node resolve it?"

Example:

```js
console.log(import.meta.resolve("fs"));
```

For a built-in module, this can resolve to:

```text
node:fs
```

For a local module:

```js
console.log(import.meta.resolve("./math.js"));
```

It can produce something like:

```text
file:///home/aman/Codebase/Procoddr-Core/Fundamentals/module_system/math.js
```

Mental model:

```js
import.meta.resolve(...)
```

means:

```text
"Where does this import point to?"
```

---

## 7. Why does `resolve` show `ƒ`?

When printing:

```js
console.log(import.meta);
```

Node shows:

```text
resolve: ƒ
```

because `resolve` is an actual JavaScript function.

You may see details such as:

```text
arguments
caller
length
name
prototype
[[FunctionLocation]]
[[Scopes]]
```

These are properties/internal information associated with the function.

You normally don't need to worry about these details when learning `import.meta`.

---

## 8. Why do `dirname` and `filename` show `<accessor>`?

The console/debugger may display:

```text
dirname = <accessor>
filename = <accessor>
```

This means Node implements these properties using **accessors/getters**.

Conceptually, it is similar to:

```js
{
  get filename() {
    // Node provides the filename
  }
}
```

rather than simply storing:

```js
{
  filename: "/home/aman/..."
}
```

When you access:

```js
import.meta.filename
```

the accessor provides the value.

---

## 9. Practical example

Try this in `app.js`:

```js
console.log("URL:", import.meta.url);

console.log("Filename:", import.meta.filename);

console.log("Directory:", import.meta.dirname);

console.log("Main:", import.meta.main);

console.log(
  "Node:",
  import.meta.resolve("node:fs")
);

console.log(
  "Math:",
  import.meta.resolve("./math.js")
);
```

Conceptually, the output will look like:

```text
URL:
file:///home/aman/Codebase/Procoddr-Core/Fundamentals/module_system/app.js

Filename:
/home/aman/Codebase/Procoddr-Core/Fundamentals/module_system/app.js

Directory:
/home/aman/Codebase/Procoddr-Core/Fundamentals/module_system

Main:
true

Node:
node:fs

Math:
file:///home/aman/Codebase/Procoddr-Core/Fundamentals/module_system/math.js
```

---

# 10. CommonJS vs ES Modules

A useful comparison:

| CommonJS | ES Modules |
|---|---|
| `__filename` | `import.meta.filename` |
| `__dirname` | `import.meta.dirname` |
| `require()` | `import` |
| `module.exports` | `export` |
| `require.main === module` | `import.meta.main` |

---

# 11. Mental Model

Remember:

```text
import.meta
│
├── url
│     └── URL of the current module
│
├── filename
│     └── filesystem path of the current module
│
├── dirname
│     └── directory containing the current module
│
├── main
│     └── true if this module started Node
│
└── resolve()
      └── resolves an import specifier
```

## Key takeaway

> `import.meta` is metadata provided by the JavaScript runtime about the current ES module.

The two especially useful concepts are:

```js
import.meta.main
```

→ Check whether the current module is the entry file.

and:

```js
import.meta.resolve("./some-module.js")
```

→ Ask Node how an import would be resolved.

For module-system learning, remember the big picture:

```text
CommonJS
────────────────────
__filename
__dirname
require()
module
exports


ES Modules
────────────────────
import.meta.url
import.meta.filename
import.meta.dirname
import.meta.resolve()
import
export
```
