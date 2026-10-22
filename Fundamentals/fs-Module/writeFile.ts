import { log } from "node:console";
import { writeFile, appendFile ,mkdir,readdir ,stat} from "node:fs/promises";

// await writeFile("./test2.txt","hello for write file \nwriting second time")

// await appendFile("./test2.txt","\nnow i am appending content")


// await mkdir("./uploads/images/thumbnails",{
//     recursive:true
// });

// const files =await readdir("./uploads")
// console.log(files);

const info = await stat("./test2.txt")
console.log(info);
