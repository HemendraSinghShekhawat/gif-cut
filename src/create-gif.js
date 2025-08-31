"use strict";
console.log("Hello, World!");
const gifBuffer = [];
const writeUTFBytes = (str) => {
    for (let len = str.length, i = 0; i < len; i++) {
        gifBuffer.push(str.charCodeAt(i));
    }
};
writeUTFBytes("GIF89a");
console.log(gifBuffer);
