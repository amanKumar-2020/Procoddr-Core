import fs from "node:fs/promises";

try {
    console.time();
    let i: number = 0;
    const interval = setInterval(() => {
        console.log(i++);
        if (i == 30) {
            clearInterval(interval);
            console.timeEnd();
        }
    }, 5);
    await fs.readFile("./test.txt");
    console.log("reading done");
} catch (error) {
    console.log("error aa gaya hai bhai");
}
