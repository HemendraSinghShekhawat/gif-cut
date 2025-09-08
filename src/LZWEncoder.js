export class LZWEncoder {
    EOF;
    imgW;
    imgH;
    pixAry;
    initCodeSize;
    remaining;
    curPixel;
    BITS;
    HSIZE;
    n_bits;
    maxbits;
    maxcode;
    maxmaxcode;
    htab;
    codetab;
    hsize;
    free_ent;
    clear_flg;
    g_init_bits;
    ClearCode;
    EOFCode;
    cur_accum;
    cur_bits;
    masks;
    a_count;
    accum;
    constructor(width, height, pixels, color_depth) {
        this.imgW = width;
        this.imgH = height;
        this.pixAry = pixels;
        this.initCodeSize = Math.max(2, color_depth);
        this.EOF = -1;
        this.remaining = width * height;
        this.curPixel = 0;
        this.BITS = 12;
        this.HSIZE = 5003;
        this.n_bits = 0;
        this.maxbits = this.BITS;
        this.maxcode = 0;
        this.maxmaxcode = 1 << this.BITS;
        this.htab = [];
        this.codetab = [];
        this.hsize = this.HSIZE;
        this.free_ent = 0;
        this.g_init_bits = 0;
        this.ClearCode = 0;
        this.EOFCode = 0;
        this.clear_flg = false;
        this.cur_accum = 0;
        this.cur_bits = 0;
        this.masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F, 0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF, 0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF];
        this.a_count = 0;
        this.accum = [];
    }
    encode(os) {
        os.writeByte(this.initCodeSize);
        this.remaining = this.imgW * this.imgH;
        this.curPixel = 0;
        this.compress(this.initCodeSize + 1, os);
        os.writeByte(0);
    }
    compress(init_bits, outs) {
        let i;
        let c;
        let disp;
        let hsize_reg;
        this.g_init_bits = init_bits;
        this.clear_flg = false;
        this.n_bits = this.g_init_bits;
        this.ClearCode = 1 << (init_bits - 1);
        this.EOFCode = this.ClearCode + 1;
        this.free_ent = this.ClearCode + 2;
        this.a_count = 0;
        let ent = this.nextPixel();
        let hshift = 0;
        for (let fcode = this.hsize; fcode < 65536; fcode += 2) {
            ++hshift;
        }
        hshift = 8 - hshift;
        hsize_reg = this.hsize;
        this.cl_hash(hsize_reg);
        this.output(this.ClearCode, outs);
        outer_loop: while ((c = this.nextPixel()) !== this.EOF) {
            let fcode = (c << this.maxbits) + ent;
            let i = (c << hshift) ^ ent;
            if (this.htab[i] === fcode) {
                let ent = this.codetab[i];
                continue;
            }
            else if (this.htab[i] >= 0) {
                disp = hsize_reg - i;
                if (i === 0)
                    disp = 1;
                do {
                    if ((i -= disp) < 0)
                        i += hsize_reg;
                    if (this.htab[i] == fcode) {
                        ent = this.codetab[i];
                        continue outer_loop;
                    }
                } while (this.htab[i] >= 0);
            }
            this.output(ent, outs);
            ent = c;
            if (this.free_ent < this.maxmaxcode) {
                this.codetab[i] = this.free_ent++;
                this.htab[i] = fcode;
            }
            else
                this.cl_block(outs);
        }
        this.output(ent, outs);
        this.output(this.EOFCode, outs);
    }
    cl_block(outs) {
        this.cl_hash(this.hsize);
        this.free_ent = this.ClearCode + 2;
        this.clear_flg = true;
        this.output(this.ClearCode, outs);
    }
    output(code, outs) {
        this.cur_accum &= this.masks[this.cur_bits];
        if (this.cur_bits > 0)
            this.cur_accum |= (code << this.cur_bits);
        else
            this.cur_accum = code;
        this.cur_bits += code;
        while (this.cur_bits >= 8) {
            this.char_out((this.cur_accum & 0xff), outs);
            this.cur_accum >>= 8;
            this.cur_bits -= 8;
        }
        if (this.free_ent > this.maxcode || this.clear_flg) {
            if (this.clear_flg) {
                this.maxcode = this.MAXCODE(this.n_bits = this.g_init_bits);
                this.clear_flg = false;
            }
            else {
                ++this.n_bits;
                if (this.n_bits === this.maxbits)
                    this.maxcode = this.maxmaxcode;
                else
                    this.maxcode = this.MAXCODE(this.n_bits);
            }
        }
        if (code === this.EOFCode) {
            while (this.cur_bits > 0) {
                this.char_out((this.cur_accum & 0xff), outs);
                this.cur_accum >>= 8;
                this.cur_bits -= 8;
            }
        }
    }
    MAXCODE(n_bits) {
        return (1 << n_bits) - 1;
    }
    flush_char(outs) {
        if (this.a_count > 0) {
            outs.writeByte(this.a_count);
            outs.writeBytes(this.accum, 0, this.a_count);
            this.a_count = 0;
        }
    }
    char_out(c, outs) {
        this.accum[this.a_count++] = c;
        if (this.a_count >= 254)
            this.flush_char(outs);
    }
    c_block(outs) {
        this.cl_hash(this.hsize);
        this.free_ent = this.ClearCode + 2;
        this.clear_flg = true;
        this.output(this.ClearCode, outs);
    }
    cl_hash(hsize) {
        for (let i = 0; i < hsize; ++i)
            this.htab[i] = -1;
    }
    nextPixel() {
        if (this.remaining === 0)
            return this.EOF;
        --this.remaining;
        let pix = this.pixAry[this.curPixel++];
        return pix & 0xff;
    }
}
