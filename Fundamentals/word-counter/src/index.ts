#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: word-counter <file> [word]");
    process.exit(1);
}

let fileToRead: string;

try {
    fileToRead = await readFile(filePath, "utf8");
} catch (error) {
    console.error(`Could not read file: ${filePath}`);
    console.error(error);
    process.exit(1);
}

const words = fileToRead.split(/\s+/);

interface WordCount {
    [word: string]: number;
}

const wordCount: WordCount = {};

for (const word of words) {
    if (!word) continue;

    wordCount[word] = (wordCount[word] || 0) + 1;
}

const findWord = process.argv[3];

if (findWord) {
    console.log(`${findWord}: ${wordCount[findWord] ?? 0}`);
} else {
    console.log(wordCount);
}