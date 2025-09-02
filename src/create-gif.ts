class ByteArray {
  bin: number[] = [];
  constructor() {
    this.bin = [];
  }

  getChrCode(i: number) {
    return String.fromCharCode(i);
    // return chr[i];
  }

  getData() {
    for (var v = "", l = this.bin.length, i = 0; i < l; i++)
      v += this.getChrCode(this.bin[i]);
    return v;
  }

  writeByte(val: number) {
    this.bin.push(val);
  }

  writeBytes(array: number[], offset?: number, length?: number) {
    for (let l = length || array.length, i = offset || 0; i < l; i++) {
      this.writeByte(array[i]);
    }
  }

  writeUTFBytes(str: string) {
    for (let len = str.length, i = 0; i < len; i++) {
      this.bin.push(str.charCodeAt(i));
    }
  }
}

// class GIFEncoder {
// 	width: number;
// 	height: number;
// 	transparent: null;
//
// }

const gifBuffer = new ByteArray();

gifBuffer.writeUTFBytes("GIF89a");
console.log(gifBuffer);
