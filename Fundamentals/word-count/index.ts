#!/usr/bin/env node

import { readFile } from "node:fs/promises";

let file_1: string = process.argv[2] ?? "./file-1.txt";
let fileToRead: string = "";

try {
  fileToRead = await readFile(file_1, "utf-8");
} catch (error) {
  console.error("error while reading", error);
}
const words = fileToRead.split(/\s+/);

interface OBJ {
  [key: string]: number;
}
const obj: OBJ = {};

for (const word of words) {
  if (word in obj) {
    obj[word] = (obj[word] || 0) + 1;
  } else {
    obj[word] = 1;
  }
}
const findWord = process.argv[3] ?? "";
if (process.argv[3]) {
  console.log(`${process.argv[3]}: ${obj[findWord]}`);
} else {
  console.log(obj);
}
