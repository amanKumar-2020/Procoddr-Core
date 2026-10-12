const b = loadModule("./math.js");
console.log(b);

function loadModule(path) {
    const fs = require("fs");
    const fileContent = fs.readFileSync(path).toString();

    return (function (send) {
        console.log("Hello from IIFE!");

        eval(fileContent);

        return send;
    })({});
}
