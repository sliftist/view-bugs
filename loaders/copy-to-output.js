const fs = require("fs");
const path = require("path");

function readFilePromise(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            err ? resolve("") : resolve(data);
        });
    });
}
function writeFilePromise(filePath, contents) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, contents, (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
}
function copyFilePromise(source, dest) {
    return new Promise((resolve, reject) => {
        fs.copyFile(source, dest, (err) => {
            err ? reject(err) : resolve();
        });
    });
}

function mkdirPromise(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, { recursive: true }, (err) => {
            err ? reject(err) : resolve();
        });
    });
}

module.exports = async function() {
    let inputPath = this.resourcePath.replace(/\\/g, "/");

    let relativePath = this.resource.slice(this.rootContext.length).replace(/\\/g, "/");

    let outputPath = (
        this._compilation.options.output.path.replace(/\\/g, "/")
        + "/"
        + relativePath
    );
    
    await mkdirPromise(path.dirname(outputPath));

    await copyFilePromise(inputPath, outputPath);

    return "{}";
};
