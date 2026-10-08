# `module.exports` vs `exports` in Node.js

## 1. `module.exports`

`module.exports` is the **actual value exported** from a CommonJS module.

### Example

```js
// math.js

const add = (a, b) => a + b;

module.exports = add;
```

Then:

```js
// app.js

const add = require("./math");

console.log(add(2, 3)); // 5
```

When we write:

```js
module.exports = add;
```

we are saying:

> "When this file is required, return the `add` function."

---

## 2. `exports`

Initially, Node.js provides:

```js
exports = module.exports;
```

Therefore, both initially point to the same object.

```js
// math.js

exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
```

Then:

```js
const math = require("./math");

console.log(math.add(5, 2));      // 7
console.log(math.subtract(5, 2)); // 3
```

Conceptually:

```text
exports ───────────┐
                   ↓
              module.exports
                   ↓
            { add, subtract }
```

---

# 3. The Important Difference

The key thing to remember:

> **`module.exports` is the actual export. `exports` is initially just a reference to `module.exports`.**

### This works ✅

```js
exports.name = "Aman";
exports.age = 23;
```

This is effectively:

```js
module.exports.name = "Aman";
module.exports.age = 23;
```

Both modify the same object.

---

### This does NOT work ❌

```js
exports = {
    name: "Aman",
    age: 23
};
```

Why?

Because now `exports` points to a **new object**, while `module.exports` still points to the original object.

```text
Before:

exports ──────────────┐
                      ↓
module.exports ────→ {}


After:

exports ──────────→ { name, age }

module.exports ───→ {}
```

Node.js returns:

```js
module.exports
```

So the new object assigned to `exports` is not exported.

---

# 4. Exporting an Object

If you want to export multiple values, you can use:

```js
module.exports = {
    add,
    subtract,
    multiply
};
```

Then:

```js
const math = require("./math");

math.add(10, 5);
math.subtract(10, 5);
```

You can also write:

```js
exports.add = add;
exports.subtract = subtract;
exports.multiply = multiply;
```

Both approaches result in an exported object containing those properties.

---

# 5. Exporting a Single Value

If you want to export one function, object, class, etc., use:

```js
module.exports = add;
```

Example:

```js
// logger.js

function logger(message) {
    console.log(message);
}

module.exports = logger;
```

Then:

```js
const logger = require("./logger");

logger("Hello World");
```

---

# 6. Why `exports = ...` Doesn't Work

Consider:

```js
exports.a = 10;

exports = {
    b: 20
};

module.exports.c = 30;
```

The exported result is:

```js
{
    a: 10,
    c: 30
}
```

It is **not**:

```js
{
    b: 20
}
```

Because:

```js
exports = {
    b: 20
};
```

only changed the local `exports` variable.

`module.exports` still refers to the original object.

---

# 7. Mental Model

At the beginning of a CommonJS module, think of it as:

```js
exports = module.exports;
```

So initially:

```text
exports ──────────────┐
                      ↓
module.exports ───→ {}
```

### When you do this:

```js
exports.name = "Aman";
```

You modify the existing object:

```text
exports ──────────────┐
                      ↓
module.exports ───→ { name: "Aman" }
```

### But when you do this:

```js
exports = {
    name: "Aman"
};
```

You change what `exports` points to:

```text
exports ─────────────→ { name: "Aman" }

module.exports ─────→ {}
```

Node returns `module.exports`, so the new object is not exported.

---

# 8. The Golden Rule 🔥

Remember this:

```text
exports.foo = value
        ↓
Add/modify a property of the existing export
```

```text
module.exports = value
        ↓
Replace the entire exported value
```

### In one sentence:

> **Use `exports.foo` to add properties, and use `module.exports = ...` when you want to replace the entire export.**

---

# Quick Revision

| Code | What it does |
|---|---|
| `exports.foo = foo` | Adds `foo` to the exported object |
| `module.exports.foo = foo` | Also adds `foo` to the exported object |
| `module.exports = foo` | Replaces the entire export with `foo` |
| `exports = foo` | Only changes the local `exports` reference ❌ |

### Most important concept

```js
exports = module.exports;
```

Initially, both refer to the same object.

But if you reassign `exports`, they are no longer connected.

**Node.js ultimately exports `module.exports`.**