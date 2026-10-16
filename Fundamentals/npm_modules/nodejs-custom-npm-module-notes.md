# Node.js Custom npm Module & Package Resolution — Notes

## Goal

This is a learning experiment, **not a publishing project**.

The goal is to understand:

- How Node.js resolves modules and packages
- Why `node_modules` works
- How a custom package can be created manually
- How `package.json` controls a package
- How `exports` creates a public API
- How Node searches for packages
- Difference between local and global npm installation
- How pnpm stores and links packages
- How all of these pieces connect

---

## 1. Basic custom package

A simple experiment:

```text
project/
├── node_modules/
│   └── my-package/
│       └── index.js
├── app.js
└── package.json
```

`package.json`:

```json
{
  "type": "module"
}
```

`node_modules/my-package/index.js`:

```js
export const num = 32;
```

`app.js`:

```js
import { num } from "my-package";

console.log(num);
```

Running:

```bash
node app.js
```

prints:

```text
32
```

### What happens?

`"my-package"` is a **bare package specifier**.

Conceptually:

```text
import "my-package"
      ↓
node_modules/my-package
      ↓
index.js
      ↓
export const num = 32
      ↓
num === 32
```

A manually created directory inside `node_modules` can therefore behave like a basic package.

---

## 2. Three important import types

### Relative import

```js
import something from "./something.js";
```

Means:

> Resolve relative to the current module.

Example:

```text
project/
├── app.js
└── something.js
```

Node does not search `node_modules` for this relative path.

### Package/bare import

```js
import something from "my-package";
```

Means:

> Find a package named `my-package`.

Node searches appropriate `node_modules` directories.

### Node built-in

```js
import fs from "node:fs";
```

`fs` is provided by Node itself.

---

## 3. Why `node_modules` matters

Node's package resolution knows about directories named:

```text
node_modules
```

Example:

```text
my-project/
├── app.js
└── node_modules/
    ├── express/
    ├── lodash/
    └── my-package/
```

Then:

```js
import express from "express";
```

can resolve to:

```text
my-project/node_modules/express
```

---

## 4. Node searches UPWARD, not DOWNWARD

One of the most important concepts.

For a module such as:

```text
/home/aman/Codebase/Procoddr-Core/Fundamentals/npm_modules/app.js
```

the observed search paths were:

```text
0 = /home/aman/Codebase/Procoddr-Core/Fundamentals/npm_modules/node_modules
1 = /home/aman/Codebase/Procoddr-Core/Fundamentals/node_modules
2 = /home/aman/Codebase/Procoddr-Core/node_modules
3 = /home/aman/Codebase/node_modules
4 = /home/aman/node_modules
5 = /home/node_modules
6 = /node_modules
```

Pattern:

```text
npm_modules
      ↓
Fundamentals
      ↓
Procoddr-Core
      ↓
Codebase
      ↓
aman
      ↓
home
      ↓
/
```

Node climbs the directory tree looking for `node_modules`.

It does **not** scan every directory on the machine.

### Important consequence

If a package exists here:

```text
Fundamentals/npm_modules/node_modules/my-package
```

and the importing file is:

```text
Fundamentals/another/app.js
```

Node does not search:

```text
Fundamentals/another
       ↓
npm_modules
```

because `npm_modules` is a sibling/downward path.

Node searches ancestor `node_modules` directories.

---

## 5. Package entry point

A basic package can be:

```text
node_modules/
└── my-package/
    └── index.js
```

A more explicit package can have:

```text
my-package/
├── package.json
└── index.js
```

Example:

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "type": "module",
  "main": "./index.js"
}
```

Conceptually:

```text
package name
     ↓
package directory
     ↓
package metadata
     ↓
entry point
     ↓
JavaScript module
```

---

## 6. ESM and `"type": "module"`

A project can contain:

```json
{
  "type": "module"
}
```

This tells Node to treat `.js` files in that package scope as ES modules.

Therefore:

```js
export const num = 32;
```

and:

```js
import { num } from "my-package";
```

work as ESM.

CommonJS uses:

```js
module.exports = {
  num: 32
};
```

and:

```js
const { num } = require("my-package");
```

Mental model:

```text
ESM
import / export

CommonJS
require / module.exports
```

---

## 7. Packages can expose functions

Instead of only:

```js
export const num = 32;
```

a package can contain:

```js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}
```

Consumer:

```js
import {
  add,
  subtract,
  multiply
} from "my-package";

console.log(add(10, 20));
console.log(subtract(20, 10));
console.log(multiply(5, 4));
```

This is the beginning of designing a package API.

---

## 8. Multiple files inside a package

A package does not need to put everything in `index.js`.

Example:

```text
my-package/
├── package.json
├── index.js
├── math/
│   ├── add.js
│   ├── subtract.js
│   └── multiply.js
├── string/
│   ├── capitalize.js
│   └── reverse.js
└── README.md
```

`index.js` can re-export public functions:

```js
export { add } from "./math/add.js";
export { subtract } from "./math/subtract.js";
export { multiply } from "./math/multiply.js";

export { capitalize } from "./string/capitalize.js";
export { reverse } from "./string/reverse.js";
```

This creates a clean public API.

---

## 9. `index.js` as the public API

Think:

```text
                 PACKAGE
                    │
          ┌─────────┴─────────┐
          │                   │
     INTERNAL CODE        PUBLIC API
          │                   │
    helper.js             index.js
    database.js           math.js
    validator.js
                            │
                            ↓
                         consumer
```

The package can contain internal implementation details while `index.js` decides what users should use.

---

## 10. `exports`

A modern package can use:

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./index.js"
  }
}
```

The `"."` entry represents the package root:

```js
import something from "my-awesome-package";
```

Conceptually:

```text
"my-awesome-package"
        ↓
exports["."]
        ↓
"./index.js"
```

---

## 11. Subpath exports

The custom package experiment used:

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "my-package": "node my-package.js"
  },
  "exports": {
    ".": "./index.js",
    "./math": "./math.js",
    "./string": "./string.js"
  },
  "author": "Aman",
  "description": "A simple utility package"
}
```

This exposes:

```text
my-awesome-package
my-awesome-package/math
my-awesome-package/string
```

Mappings:

```text
"."        → ./index.js
"./math"   → ./math.js
"./string" → ./string.js
```

So consumers can use:

```js
import something from "my-awesome-package";
```

or:

```js
import { add } from "my-awesome-package/math";
```

or:

```js
import { capitalize } from "my-awesome-package/string";
```

---

## 12. Why `exports` is powerful

Suppose:

```text
my-awesome-package/
├── index.js
├── math.js
├── string.js
└── secret.js
```

but:

```json
{
  "exports": {
    ".": "./index.js",
    "./math": "./math.js"
  }
}
```

Then `secret.js` can exist physically without being part of the intended public API.

Mental model:

```text
PACKAGE
│
├── Internal
│   ├── secret.js
│   ├── helper.js
│   └── database.js
│
└── Public API
    ├── index.js
    └── math.js
```

`exports` controls the public surface of a package.

---

## 13. Important `package.json` fields

Common fields:

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "A simple utility package",
  "type": "module",
  "main": "./index.js",
  "exports": {
    ".": "./index.js"
  },
  "scripts": {
    "my-package": "node my-package.js"
  },
  "keywords": [
    "utility",
    "javascript",
    "node"
  ],
  "author": "Aman",
  "license": "MIT"
}
```

### `name`

Package identity.

### `version`

Usually semantic versioning:

```text
MAJOR.MINOR.PATCH
1.0.0
```

Examples:

```text
1.0.0 → 1.0.1   bug fix
1.0.0 → 1.1.0   backward-compatible feature
1.0.0 → 2.0.0   breaking change
```

### `description`

Short description.

### `type`

Controls JS module interpretation.

### `main`

Traditional/main entry point.

### `exports`

Modern, more controlled package API.

### `scripts`

Development commands.

### `dependencies`

Runtime dependencies.

### `devDependencies`

Development/my-packageing/build dependencies.

---

## 14. Dependencies vs devDependencies

Runtime:

```json
{
  "dependencies": {
    "some-library": "^1.0.0"
  }
}
```

Development only:

```json
{
  "devDependencies": {
    "some-my-package-framework": "^1.0.0"
  }
}
```

Mental model:

```text
dependencies
    ↓
needed by the application/package

devDependencies
    ↓
needed by developers/tools
```

---

## 15. `npm install <package>`

Inside a project:

```bash
npm install lodash
```

npm installs it for that project.

Typical result:

```text
my-project/
├── node_modules/
│   └── lodash/
├── package.json
├── package-lock.json
└── app.js
```

The dependency is recorded in `package.json`.

Meaning:

> This project needs this package.

Different projects can use different versions:

```text
project-A → express@4
project-B → express@5
```

---

## 16. `npm install -g <package>`

The `-g` means global.

```bash
npm install -g typescript
```

The package is installed into npm's global location rather than the current project's `node_modules`.

Useful commands:

```bash
npm root -g
npm prefix -g
```

Global installation is commonly used for CLI tools.

Example:

```bash
npm install -g typescript
```

Then:

```bash
tsc --version
```

Mental model:

```text
npm install package
    ↓
this project needs package

npm install -g package
    ↓
user/machine-level CLI tool
```

For development tools, local installation is often preferable:

```bash
npm install -D eslint
```

then:

```bash
npx eslint .
```

or through:

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

---

## 17. Local package installation

Instead of manually placing a package inside `node_modules`:

```text
Code/
├── my-package/
│   ├── package.json
│   └── index.js
│
└── my-app/
    ├── package.json
    └── app.js
```

inside `my-app`:

```bash
npm install ../my-package
```

npm manages the installation.

This is a useful experiment because it shows how a package becomes a real project dependency without publishing it.

---

## 18. `npm link`

For package development:

```bash
npm link
```

can create a symlink relationship.

Conceptually:

```text
my-package/
      ↑
      │ symlink
      │
my-app/node_modules/my-package
```

This lets an app use the development version of a local package.

---

## 19. `npm pack`

Run:

```bash
npm pack
```

This creates an archive such as:

```text
my-package-1.0.0.tgz
```

It can be installed locally:

```bash
npm install ./my-package-1.0.0.tgz
```

This is useful for learning what a package archive contains, even when you never intend to publish anything.

---

# 20. pnpm

pnpm is another Node.js package manager.

Basic:

```bash
pnpm add lodash
```

From the project's point of view, this means:

> Add lodash to this project's dependency graph.

The major architectural difference is how package data is stored and linked.

---

## 21. pnpm content-addressable store

Find the pnpm store:

```bash
pnpm store path
```

pnpm maintains a shared store of package contents.

If several projects use the same package/version:

```text
                 pnpm store
                      │
                 lodash@4.17.21
                      │
            ┌─────────┼─────────┐
            ↓         ↓         ↓
        project A  project B  project C
```

pnpm can reuse stored package content rather than keeping completely independent copies everywhere.

This can save disk space and improve installation efficiency.

---

## 22. pnpm's `node_modules`

A pnpm project may conceptually look like:

```text
node_modules/
├── .pnpm/
│   ├── lodash@4.17.21/
│   └── express@.../
│
├── lodash -> .pnpm/...
└── express -> .pnpm/...
```

The arrows represent links.

Conceptually:

```text
node_modules/lodash
        ↓
       link
        ↓
node_modules/.pnpm/...
        ↓
pnpm store
```

The exact internal layout depends on pnpm version/configuration, but the key idea is:

> shared store + links into projects.

---

## 23. Why pnpm can save space

Imagine 100 projects all use:

```text
react
typescript
eslint
lodash
```

pnpm can reuse package contents through its store.

Mental model:

```text
                pnpm store
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   project A     project B     project C
       │             │             │
       └─────────────┼─────────────┘
                     ↓
              shared package data
```

---

## 24. pnpm can still support multiple versions

Example:

```text
project-A → lodash@4
project-B → lodash@3
```

The store can contain both:

```text
pnpm store
├── lodash@3
└── lodash@4
```

Each project references the version it needs.

Key idea:

```text
shared storage
+
project-specific dependency graph
```

---

## 25. pnpm dependency isolation

pnpm's structure is intentionally designed so dependency relationships are represented explicitly.

If:

```text
package-a
    ↓
depends on package-b
```

that relationship is represented instead of simply relying on an accidental flat `node_modules` layout.

This can help reveal undeclared dependency mistakes.

---

## 26. Recommended pnpm experiment

Create:

```bash
mkdir pnpm-lab
cd pnpm-lab
pnpm init
```

Install:

```bash
pnpm add lodash
```

Inspect:

```bash
ls -la node_modules
```

Then:

```bash
ls -la node_modules/.pnpm
```

Then:

```bash
pnpm store path
```

Trace the architecture:

```text
import "lodash"
       ↓
node_modules/lodash
       ↓
link/reference
       ↓
node_modules/.pnpm
       ↓
pnpm store
```

This is much better than memorizing the architecture.

---

# 27. Complete mental model

```text
                 package manager
                /                             npm               pnpm
               │                 │
               ↓                 ↓
        package installation   shared store
               │                 │
               ↓                 ↓
          node_modules       links/references
               │                 │
               └────────┬────────┘
                        ↓
                  Node resolver
                        │
                        ↓
              import "some-package"
                        │
                        ↓
              find node_modules
                        │
                        ↓
                  package.json
                        │
                 ┌──────┴──────┐
                 ↓             ↓
                main         exports
                 │             │
                 └──────┬──────┘
                        ↓
                  actual module
                        │
                        ↓
                  JS execution
```

---

# 28. Rules worth remembering

### Rule 1

```js
import "./foo.js";
```

→ resolve relative to the current module.

### Rule 2

```js
import "foo";
```

→ resolve a package named `foo`.

### Rule 3

For bare package imports, Node searches ancestor `node_modules` directories:

```text
current directory
      ↓
../node_modules
      ↓
../../node_modules
      ↓
../../../node_modules
      ↓
...
```

### Rule 4

Node does not search sibling directories just because they contain `node_modules`.

### Rule 5

```bash
npm install package
```

→ project-local dependency installation.

### Rule 6

```bash
npm install -g package
```

→ global installation, commonly for CLI tools.

### Rule 7

`package.json` describes package metadata and behavior.

### Rule 8

`exports` defines the package's public entry points.

### Rule 9

pnpm uses a shared content-addressable store and links package contents into projects.

---

# 29. Best learning path

Continue experimenting in this order:

```text
1. Manual node_modules package
          ↓
2. package.json inside the package
          ↓
3. main
          ↓
4. exports
          ↓
5. subpath exports
          ↓
6. internal/private files
          ↓
7. multiple packages
          ↓
8. npm install ../my-package
          ↓
9. npm link
          ↓
10. npm pack
          ↓
11. Compare npm node_modules
          ↓
12. Compare pnpm node_modules
          ↓
13. Inspect pnpm store
          ↓
14. Understand dependency graphs
          ↓
15. Experiment with ESM/CommonJS
          ↓
16. Explore TypeScript package output
```

Do not rush to publishing.

The main skill is being able to look at:

```js
import { add } from "my-awesome-package/math";
```

and mentally explain:

```text
"my-awesome-package/math"
          ↓
bare package specifier
          ↓
find package in node_modules
          ↓
read package metadata
          ↓
check exports
          ↓
match "./math"
          ↓
resolve "./math.js"
          ↓
load module
          ↓
get `add`
```

Once you can predict that process, you understand much more than just how to run npm commands — you understand the machinery underneath Node.js packages.
