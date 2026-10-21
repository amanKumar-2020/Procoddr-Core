import { readFile } from "node:fs/promises"
// import fs from "node:fs/promises"

let file_1: string = "";
let file_2: string = "";
let file_3: string = "";
try {
     file_1 = await readFile("./file-1.txt","utf-8")
     file_2 = await readFile("./file-2.txt","utf-8")
     file_3 = await readFile("./file-3.txt","utf-8")
    
} catch (error) {
    console.error("error while reading",error)
}
// console.log(file_1.split(" "));
const words:string[] =file_1.split(" ");

interface OBJ{[key:string]:number}
const obj:OBJ = {}

for (const word of words){
    const newword =word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    if(newword in obj){
       obj[newword] = (obj[newword] || 0) + 1;
    }else{
        obj[newword] =1;
    }
    
    
}
console.log(obj);

