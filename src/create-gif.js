"use strict";
class ByteArray {
    bin = [];
    constructor() {
        this.bin = [];
    }
    getChrCode(i) {
        return String.fromCharCode(i);
    }
    getData() {
        for (var v = "", l = this.bin.length, i = 0; i < l; i++)
            v += this.getChrCode(this.bin[i]);
        return v;
    }
    writeByte(val) {
        this.bin.push(val);
    }
    writeBytes(array, offset, length) {
        for (let l = length || array.length, i = offset || 0; i < l; i++) {
            this.writeByte(array[i]);
        }
    }
    writeUTFBytes(str) {
        for (let len = str.length, i = 0; i < len; i++) {
            this.bin.push(str.charCodeAt(i));
        }
    }
}
const gifBuffer = new ByteArray();
gifBuffer.writeUTFBytes("GIF89a");
console.log(gifBuffer);
