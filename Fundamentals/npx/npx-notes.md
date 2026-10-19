# npx --- Detailed Notes

## 1. What is `npx`?

`npx` is npm's package-execution tool.

Its main purpose is to execute CLI commands provided by npm packages
without requiring those CLI tools to be installed globally.

Modern npm treats `npx` as the convenient command-line interface for
`npm exec`.

``` bash
npx <command>
```

Conceptually:

``` text
npx
 │
 └── npm exec
       │
       ├── resolve package/command
       ├── check local dependencies
       ├── obtain package if necessary
       ├── create execution environment
       ├── put executable in PATH
       └── execute command
```

------------------------------------------------------------------------

# 2. Why does `npx` exist?

Consider a package such as TypeScript.

If installed locally:

``` bash
npm install -D typescript
```

the project may contain:

``` text
project/
├── package.json
├── package-lock.json
└── node_modules/
    ├── typescript/
    └── .bin/
        └── tsc
```

The executable is available through:

``` bash
./node_modules/.bin/tsc
```

Instead of typing that long path, we can use:

``` bash
npx tsc
```

So:

``` text
./node_modules/.bin/tsc
        ↓
      npx tsc
```

`npx` makes local CLI execution convenient.

------------------------------------------------------------------------

# 3. npm package vs executable

An npm package can contain a CLI executable.

For example, a package can define:

``` json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "mycli": "./index.js"
  }
}
```

The package name is:

``` text
my-cli
```

while its executable is:

``` text
mycli
```

When installed locally, npm can create:

``` text
node_modules/.bin/mycli
```

Then:

``` bash
npx mycli
```

can execute it.

This is the connection between npm packages and command-line tools.

------------------------------------------------------------------------

# 4. What is `node_modules/.bin`?

When npm installs a package that exposes a `bin` command, npm creates
executable links/shims inside:

``` text
node_modules/.bin/
```

Example:

``` text
node_modules/
├── .bin/
│   ├── eslint
│   ├── prettier
│   ├── tsc
│   └── vite
│
├── eslint/
├── prettier/
├── typescript/
└── vite/
```

You can inspect it with:

``` bash
ls -la node_modules/.bin
```

The `.bin` directory is very important for npm CLI execution.

------------------------------------------------------------------------

# 5. How `npx tsc` works

Suppose:

``` bash
npm install -D typescript
```

Then:

``` bash
npx tsc
```

roughly follows this process:

``` text
npx tsc
   │
   ▼
npm execution machinery
   │
   ▼
Find the requested executable
   │
   ▼
Check local project dependencies
   │
   ▼
node_modules/.bin/tsc
   │
   ▼
Create execution environment / PATH
   │
   ▼
Execute TypeScript CLI
```

The exact internal implementation is more complex, but this is the
correct mental model.

------------------------------------------------------------------------

# 6. Local package vs global package

## Local installation

``` bash
npm install -D typescript
```

Creates a project dependency:

``` text
project/
└── node_modules/
    └── typescript/
```

Run it with:

``` bash
npx tsc
```

The project gets its own TypeScript version.

------------------------------------------------------------------------

## Global installation

``` bash
npm install -g typescript
```

This installs TypeScript into npm's global package/bin locations.

Then you can usually run:

``` bash
tsc
```

from different directories because the global npm binary directory is
available through your shell's `PATH`.

------------------------------------------------------------------------

## One-off `npx` execution

``` bash
npx cowsay "Hello"
```

If the package isn't already available locally, npm can obtain it for
execution without adding it as a normal project dependency.

------------------------------------------------------------------------

# 7. Important comparison

  Command                Purpose
  ---------------------- ------------------------------------------
  `npm install foo`      Install `foo` as a project dependency
  `npm install -D foo`   Install `foo` as a dev dependency
  `npm install -g foo`   Install `foo` globally
  `npx foo`              Execute `foo`
  `npm exec -- foo`      Execute `foo`
  `npm run foo`          Run the `foo` script from `package.json`

Core idea:

``` text
npm install
    ↓
dependency management

npx
    ↓
package/CLI execution

npm run
    ↓
project-defined scripts
```

------------------------------------------------------------------------

# 8. `npx` and `npm exec`

Modern npm has:

``` bash
npm exec
```

and:

``` bash
npx
```

is essentially the convenient interface for the same package-execution
functionality.

For example:

``` bash
npx eslint .
```

is conceptually equivalent to:

``` bash
npm exec -- eslint .
```

The `--` in `npm exec -- eslint .` separates npm's options from the
arguments intended for the command.

------------------------------------------------------------------------

# 9. Does `npx` install packages into `node_modules`?

Not necessarily.

If you run:

``` bash
npx some-cli
```

and `some-cli` isn't already a local dependency, npm can obtain the
package and create/use an execution environment for it rather than
adding it to:

``` text
project/node_modules/
```

It also does not automatically add it to:

``` text
package.json
```

So `npx` is useful for one-off CLI execution.

Important:

``` text
npm install foo
    ↓
foo becomes a project dependency

npx foo
    ↓
execute foo
```

------------------------------------------------------------------------

# 10. `~/.npm/_npx` --- observed on this system

The user's `~/.npm` directory contains:

``` text
~/.npm/
├── _cache/
├── _logs/
├── _npx/
└── _update-notifier-last-checked
```

The important directories are:

``` text
~/.npm/_cache/
```

and:

``` text
~/.npm/_npx/
```

### `~/.npm/_cache`

This is npm's general package/content cache.

It should NOT be thought of as the project's `node_modules`.

### `~/.npm/_npx`

This is the directory associated with npm/npx execution environments.

When `npx` needs to obtain a package for execution, npm can create an
isolated execution environment under this area.

Inspect it with:

``` bash
ls -lah ~/.npm/_npx
```

You can inspect files with:

``` bash
find ~/.npm/_npx -maxdepth 3 -type f | head -50
```

And look for package manifests:

``` bash
find ~/.npm/_npx -maxdepth 3 -type f -name package.json
```

Then inspect one:

``` bash
cat ~/.npm/_npx/<directory>/package.json
```

------------------------------------------------------------------------

# 11. Important distinction: `_cache` vs `_npx`

Do NOT think:

``` text
~/.npm/_npx = all downloaded npm packages
```

A better mental model is:

``` text
                    ~/.npm
                       │
          ┌────────────┴────────────┐
          │                         │
       _cache                      _npx
          │                         │
   General npm cache          npx execution
                              environments
```

The package data involved in an npx execution can interact with npm's
general cache, while `_npx` is associated with the execution environment
created for npx.

------------------------------------------------------------------------

# 12. What happens when a package is already local?

Suppose:

``` text
project/
└── node_modules/
    ├── typescript/
    └── .bin/
        └── tsc
```

Running:

``` bash
npx tsc
```

can use the project's local executable.

Mental model:

``` text
npx tsc
   │
   ▼
Is the command available locally?
   │
   ├── YES
   │    ↓
   │  node_modules/.bin/tsc
   │    ↓
   │  execute local version
   │
   └── NO
        ↓
      resolve/obtain package
        ↓
      execution environment
        ↓
      execute
```

This is why project-local CLI tools are generally preferable for
reproducible projects.

------------------------------------------------------------------------

# 13. Why local CLI versions are useful

Imagine two projects:

``` text
Project A
└── TypeScript 5.8

Project B
└── TypeScript 5.9
```

With local dependencies:

``` bash
cd project-a
npx tsc
```

uses Project A's environment.

And:

``` bash
cd project-b
npx tsc
```

uses Project B's environment.

This avoids depending on one global TypeScript installation.

------------------------------------------------------------------------

# 14. Specifying a version

You can request a particular package version:

``` bash
npx typescript@5.8.3 --version
```

You can also use tags/specifiers such as:

``` bash
npx typescript@latest --version
```

or a major version:

``` bash
npx typescript@5 --version
```

This is useful for testing different CLI versions without permanently
changing the project's dependency.

------------------------------------------------------------------------

# 15. `npx create-vite`

A common example:

``` bash
npx create-vite my-app
```

`npx` is not itself creating the project.

Instead:

``` text
npx
 ↓
resolve/fetch create-vite
 ↓
make its executable available
 ↓
execute create-vite
 ↓
create-vite generates my-app/
```

The package `create-vite` contains the actual project-generation logic.

`npx` is the executor.

------------------------------------------------------------------------

# 16. Package name does not have to equal command name

Example:

``` json
{
  "name": "my-awesome-tool",
  "version": "1.0.0",
  "bin": {
    "awesome": "./cli.js"
  }
}
```

Package:

``` text
my-awesome-tool
```

Executable:

``` text
awesome
```

Therefore:

``` bash
npx awesome
```

can execute the `awesome` binary provided by that package.

If the package and executable names don't resolve automatically in the
desired way, `--package` can explicitly provide the package:

``` bash
npx --package=my-awesome-tool awesome
```

------------------------------------------------------------------------

# 17. `npx --package`

`--package` tells npm which package should provide the executable.

Conceptually:

``` bash
npx --package=some-package some-command
```

means:

``` text
Make some-package available
        ↓
Expose its executable(s)
        ↓
Run some-command
```

Multiple packages can also be supplied.

------------------------------------------------------------------------

# 18. `npx -y`

When npx needs to obtain a package, it may ask for confirmation.

You can automatically accept with:

``` bash
npx -y some-package
```

or:

``` bash
npx --yes some-package
```

Useful for automation, but remember that it removes an interactive
confirmation step.

------------------------------------------------------------------------

# 19. `npx` and `$PATH`

This is one of the most important low-level concepts.

Your normal shell has a `PATH`:

``` bash
echo $PATH
```

It may contain directories such as:

``` text
/usr/local/bin
/usr/bin
...
```

But a project has:

``` text
project/node_modules/.bin
```

When npm executes a package command, it can put the local `.bin`
directory into the command's execution `PATH`.

Conceptually:

``` text
PATH

project/node_modules/.bin
        ↓
/usr/local/bin
        ↓
/usr/bin
        ↓
...
```

Then:

``` bash
tsc
```

can resolve to:

``` text
project/node_modules/.bin/tsc
```

This is a major reason local package commands work through npm and npx.

------------------------------------------------------------------------

# 20. `npm run` does something similar

Suppose:

``` json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}
```

Run:

``` bash
npm run dev
```

npm makes local binaries such as:

``` text
node_modules/.bin/vite
```

available to the script.

So:

``` text
npm run dev
      ↓
package.json
      ↓
scripts.dev = "vite"
      ↓
PATH includes node_modules/.bin
      ↓
vite
      ↓
node_modules/.bin/vite
```

This is closely related to how `npx` makes local executables convenient
to run.

------------------------------------------------------------------------

# 21. `npx` security

Be careful with:

``` bash
npx random-package
```

You are potentially executing third-party code.

An npm package can contain:

``` text
JavaScript
install scripts
postinstall scripts
native binaries
filesystem operations
network operations
etc.
```

Before executing an unfamiliar package, inspect it:

``` bash
npm view package-name
```

You can also inspect metadata such as:

``` bash
npm view package-name version
npm view package-name repository
```

Check its npm page/source repository and understand what you are
running.

Important principle:

``` text
npx = convenient execution

npx ≠ trusted execution
```

------------------------------------------------------------------------

# 22. `npx` is not simply "temporary npm install"

A common beginner explanation is:

> npx temporarily installs packages.

A more accurate mental model is:

> `npx` executes package-provided commands using local project
> dependencies when appropriate, and can obtain/cache requested packages
> and create an execution environment when the command isn't available
> locally.

This distinction matters because npm's cache, project `node_modules`,
and npx execution directories have different roles.

------------------------------------------------------------------------

# 23. Building your own CLI

This connects directly to custom npm modules.

Project:

``` text
my-cli/
├── package.json
└── index.js
```

`package.json`:

``` json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "mycli": "./index.js"
  }
}
```

`index.js`:

``` js
#!/usr/bin/env node

console.log("Hello from my CLI!");
```

After installing the package into another project:

``` bash
npm install ../my-cli
```

npm can create:

``` text
node_modules/.bin/mycli
```

Then:

``` bash
npx mycli
```

executes:

``` text
npx mycli
    ↓
node_modules/.bin/mycli
    ↓
my-cli/index.js
    ↓
Node.js
    ↓
console.log(...)
```

This is the basic architecture behind many npm CLI tools.

------------------------------------------------------------------------

# 24. The `#!/usr/bin/env node` line

This:

``` js
#!/usr/bin/env node
```

is a Unix shebang.

It tells the operating system to execute the file using Node.js.

So the chain is:

``` text
mycli
 ↓
#!/usr/bin/env node
 ↓
Node.js
 ↓
JavaScript CLI
```

------------------------------------------------------------------------

# 25. Core mental model

When you see:

``` bash
npx tool
```

think:

``` text
                 npx
                  │
                  ▼
          "I need to run tool"
                  │
                  ▼
       Is tool available locally?
            /             \
          YES              NO
           │                │
           ▼                ▼
   node_modules/.bin    resolve/obtain
           │                │
           │                ▼
           │          npm cache / npx
           │          execution area
           │                │
           └──────┬─────────┘
                  ▼
          executable in PATH
                  │
                  ▼
             run command
                  │
                  ▼
             Node program
```

------------------------------------------------------------------------

# 26. Three commands to remember

## Install

``` bash
npm install <package>
```

Think:

``` text
package
  ↓
node_modules
  ↓
package.json
  ↓
lockfile
```

## Execute

``` bash
npx <command>
```

Think:

``` text
find/resolve executable
  ↓
local dependency when appropriate
  ↓
or obtain package
  ↓
execution environment
  ↓
run
```

## Script

``` bash
npm run <script>
```

Think:

``` text
package.json
  ↓
scripts
  ↓
node_modules/.bin available
  ↓
execute script
```

------------------------------------------------------------------------

# 27. Quick reference

``` bash
# Execute a local/package CLI
npx <command>

# Execute a specific package version
npx <package>@<version> <args>

# Use latest version
npx <package>@latest <args>

# Automatically accept install prompt
npx -y <package>

# Explicitly provide a package for a command
npx --package=<package> <command>

# Equivalent npm execution interface
npm exec -- <command>

# Inspect npm cache location
npm config get cache

# Inspect npx execution area
ls -lah ~/.npm/_npx

# Inspect npm cache
ls -lah ~/.npm/_cache

# Inspect local CLI binaries
ls -la node_modules/.bin
```

------------------------------------------------------------------------

# 28. Final summary

The simplest way to remember everything:

``` text
npm
 │
 ├── install
 │     └── manages dependencies
 │
 ├── run
 │     └── runs package.json scripts
 │
 └── exec / npx
       └── executes package-provided commands
```

And the three important locations/concepts are:

``` text
project/node_modules/
    ↓
Actual project dependencies

project/node_modules/.bin/
    ↓
CLI executable links/shims for local dependencies

~/.npm/_cache/
    ↓
npm's general package/content cache

~/.npm/_npx/
    ↓
npx-related execution environments
```

### One-line definition

> **`npx` is npm's package-execution tool that lets you run CLI commands
> from local project dependencies or obtain requested packages for
> execution without requiring global installation.**
