# Word Counter CLI

A simple command-line tool built with **Node.js + TypeScript** that counts words in a text file.

## Features

- 📄 Read words from a text file
- 🔢 Count occurrences of every word
- 🔍 Search for the count of a specific word
- ⚡ Built with Node.js `fs/promises`
- 📦 Can be executed using `npx`

## Installation

You don't need to install it globally.

Run it directly with `npx`:

```bash
npx word-counter-cli <file>
```

Or install it globally:

```bash
npm install -g word-counter-cli
```

Then use:

```bash
word-counter <file>
```

## Usage

### Count all words

```bash
word-counter file.txt
```

Example output:

```text
{
  hello: 3,
  world: 2,
  node: 5
}
```

### Find a specific word

Pass the word as the second argument:

```bash
word-counter file.txt hello
```

Output:

```text
hello: 3
```

If the word doesn't exist:

```text
hello: 0
```

## Using npx

You can run the package without installing it permanently:

```bash
npx word-counter-cli file.txt
```

You can also search for a specific word:

```bash
npx word-counter-cli file.txt hello
```

## How It Works

The program uses Node.js's Promise-based filesystem API:

```ts
import { readFile } from "node:fs/promises";
```

The file is read asynchronously:

```ts
const fileToRead = await readFile(filePath, "utf8");
```

The contents are then split into words:

```ts
const words = fileToRead.split(/\s+/);
```

Each word is counted using a JavaScript object:

```ts
wordCount[word] = (wordCount[word] || 0) + 1;
```

## Project Structure

```text
word-counter/
├── src/
│   └── index.ts
├── dist/
│   └── index.js
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
└── LICENSE
```

## Development

Clone the repository:

```bash
git clone <your-repository-url>
cd word-counter
```

Install dependencies:

```bash
npm install
```

Build the TypeScript source:

```bash
npm run build
```

Run the compiled CLI:

```bash
node dist/index.js file.txt
```

## Local CLI Testing

You can link the package locally:

```bash
npm link
```

Then use the command:

```bash
word-counter file.txt
```

To remove the local link:

```bash
npm unlink -g word-counter-cli
```

## Technologies

- Node.js
- TypeScript
- `node:fs/promises`
- npm
- npx

## License

MIT