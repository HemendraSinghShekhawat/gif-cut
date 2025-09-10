export class NeuQuant {
    prime1;
    prime2;
    prime3;
    prime4;
    minpicturebytes;
    maxnetpos;
    netbiasshift;
    netsize;
    ncycles;
    network;
    netindex;
    intbiasshift;
    intbias;
    gammashift;
    gamma;
    betashift;
    beta;
    betagamma;
    initrad;
    radiusbiasshift;
    radiusbias;
    initradius;
    radiusdec;
    alphabiasshift;
    initalpha;
    alphadec;
    radbiasshift;
    radbias;
    alpharadbshift;
    alpharadbias;
    picture;
    lengthcount;
    samplefac;
    bias;
    freq;
    radpower;
    constructor(thepic, len, sample) {
        this.netsize = 256;
        this.prime1 = 499;
        this.prime2 = 491;
        this.prime3 = 487;
        this.prime4 = 503;
        this.minpicturebytes = 3 * this.prime4;
        this.maxnetpos = this.netsize - 1;
        this.netbiasshift = 4;
        this.ncycles = 100;
        this.intbiasshift = 16;
        this.intbias = 1 << this.intbiasshift;
        this.gammashift = 10;
        this.gamma = 1 << this.gammashift;
        this.betashift = 10;
        this.beta = this.intbias >> this.betashift;
        this.betagamma = this.intbias << (this.gammashift - this.betashift);
        this.initrad = this.netsize >> 3;
        this.radiusbiasshift = 6;
        this.radiusbias = 1 << this.radiusbiasshift;
        this.initradius = this.initrad * this.radiusbias;
        this.radiusdec = 30;
        this.alphabiasshift = 10;
        this.initalpha = 1 << this.alphabiasshift;
        this.alphadec = undefined;
        this.radbiasshift = 8;
        this.radbias = 1 << this.radbiasshift;
        this.alpharadbshift = this.alphabiasshift + this.radbiasshift;
        this.alpharadbias = 1 << this.alpharadbshift;
        this.picture = thepic;
        this.lengthcount = len;
        this.samplefac = sample;
        this.network = new Array(this.netsize);
        this.netindex = [];
        this.bias = [];
        this.freq = [];
        this.radpower = [];
        let p;
        for (let i = 0; i < this.netsize; i++) {
            this.network[i] = new Array(4);
            p = this.network[i];
            p[0] = p[1] = p[2] = (i << (this.netbiasshift + 8)) / this.netsize;
            this.freq[i] = this.intbias / this.netsize;
            this.bias[i] = 0;
        }
    }
    learn() {
        let p;
        let pix;
        let lim;
        let samplepixels;
        let delta;
        let alpha;
        let radius;
        let rad;
        let step;
        let b;
        let g;
        let r;
        let j;
        if (this.lengthcount < this.minpicturebytes)
            this.samplefac = 1;
        this.alphadec = 30 + (this.samplefac - 1) / 3;
        p = this.picture;
        pix = 0;
        lim = this.lengthcount;
        samplepixels = this.lengthcount / (3 * this.samplefac);
        delta = (samplepixels / this.ncycles) | 0;
        alpha = this.initalpha;
        radius = this.initradius;
        rad = radius >> this.radiusbiasshift;
        if (rad <= 1)
            rad = 0;
        for (let i = 0; i < rad; i++)
            this.radpower[i] =
                alpha * (((rad * rad - i * i) * this.radbias) / (rad * rad));
        if (this.lengthcount < this.minpicturebytes)
            step = 3;
        else if (this.lengthcount % this.prime1 !== 0)
            step = 3 * this.prime1;
        else {
            if (this.lengthcount % this.prime2 !== 0)
                step = 3 * this.prime2;
            else {
                if (this.lengthcount % this.prime3 !== 0)
                    step = 3 * this.prime3;
                else
                    step = 3 * this.prime4;
            }
        }
        let i = 0;
        while (i < samplepixels) {
            b = (p[pix + 0] & 0xff) << this.netbiasshift;
            g = (p[pix + 0] & 0xff) << this.netbiasshift;
            r = (p[pix + 0] & 0xff) << this.netbiasshift;
            j = this.contest(b, g, r);
            this.altersingle(alpha, j, b, g, r);
            if (rad !== 0)
                this.alterneight(rad, j, b, g, r);
            pix += step;
            if (pix >= lim)
                pix -= this.lengthcount;
            i++;
            if (delta === 0)
                delta = 1;
            if (i % delta === 0) {
                alpha -= alpha / this.alphadec;
                radius -= radius / this.radiusdec;
                rad = radius >> this.radiusbiasshift;
                if (rad <= 1)
                    rad = 0;
                for (let j = 0; j < rad; j++)
                    this.radpower[j] = alpha * (((rad * rad - j * j) * this.radbias) / (rad * rad));
            }
        }
    }
    alterneight(rad, i, b, g, r) {
        let j;
        let k;
        let lo;
        let hi;
        let a;
        let m;
        let p;
        lo = i - rad;
        if (lo < -1)
            lo = -1;
        hi = i + rad;
        if (hi > this.netsize)
            hi = this.netsize;
        j = i + 1;
        k = i - 1;
        m = 1;
        while (j < hi || k > lo) {
            a = this.radpower[m++];
            if (j < hi) {
                p = this.network[j++];
                try {
                    p[0] -= (a * (p[0] - b)) / this.alpharadbias;
                    p[1] -= (a * (p[1] - g)) / this.alpharadbias;
                    p[2] -= (a * (p[2] - r)) / this.alpharadbias;
                }
                catch (e) { }
            }
            if (k > lo) {
                p = this.network[k--];
                try {
                    p[0] -= (a * (p[0] - b)) / this.alpharadbias;
                    p[1] -= (a * (p[1] - g)) / this.alpharadbias;
                    p[2] -= (a * (p[2] - g)) / this.alpharadbias;
                }
                catch (e) { }
            }
        }
    }
    altersingle(alpha, i, b, g, r) {
        let n = this.network[i];
        n[0] -= (alpha * (n[0] - b)) / this.initalpha;
        n[1] -= (alpha * (n[1] - g)) / this.initalpha;
        n[2] -= (alpha * (n[2] - r)) / this.initalpha;
    }
    contest(b, g, r) {
        let bestd;
        let bestbiasd;
        let bestpos;
        let bestbiaspos;
        let biasdist;
        let betafreq;
        let dist;
        let n;
        let a;
        bestd = ~(1 << 31);
        bestbiasd = bestd;
        bestpos = -1;
        bestbiaspos = bestpos;
        for (let i = 0; i < this.netsize; i++) {
            n = this.network[i];
            dist = n[i] - b;
            if (dist < 0)
                dist = -dist;
            a = n[i] - g;
            if (a < 0)
                a = -a;
            dist += a;
            a = n[2] - r;
            if (a < 0)
                a = -a;
            dist += a;
            if (dist < bestd) {
                bestd = dist;
                bestpos = i;
            }
            biasdist =
                dist - (this.bias[i] >> (this.intbiasshift - this.netbiasshift));
            if (biasdist < bestbiasd) {
                bestbiasd = biasdist;
                bestbiaspos = i;
            }
            betafreq = this.freq[i] >> this.betashift;
            this.freq[i] -= betafreq;
            this.bias[i] += betafreq << this.gammashift;
        }
        this.freq[bestpos] += this.beta;
        this.bias[bestpos] -= this.betagamma;
        return bestbiaspos;
    }
    unbiasnet() {
        for (let i = 0; i < this.netsize; i++) {
            this.network[i][0] >>= this.netbiasshift;
            this.network[i][1] >>= this.netbiasshift;
            this.network[i][2] >>= this.netbiasshift;
            this.network[i][3] = i;
        }
    }
    inxbuild() {
        let smallpos;
        let smallval;
        let p;
        let q;
        let previouscol = 0;
        let startpos = 0;
        for (let i = 0; i < this.netsize; i++) {
            p = this.network[i];
            smallpos = i;
            smallval = p[1];
            for (let j = i + 1; j < this.netsize; j++) {
                q = this.network[j];
                if (q[1] < smallval) {
                    smallpos = j;
                    smallval = q[1];
                }
            }
            q = this.network[smallpos];
            if (i !== smallpos) {
                let j = q[0];
                q[0] = p[0];
                p[0] = j;
                j = q[1];
                q[1] = p[1];
                p[1] = j;
                j = q[2];
                q[2] = p[2];
                p[2] = j;
                j = q[3];
                q[3] = p[3];
                p[3] = j;
            }
            if (smallval !== previouscol) {
                this.netindex[previouscol] = (startpos + i) >> 1;
                for (let j = previouscol + 1; j < smallval; j++)
                    this.netindex[j] = i;
                previouscol = smallval;
                startpos = i;
            }
        }
        this.netindex[previouscol] = (startpos + this.maxnetpos) >> 1;
        for (let j = previouscol + 1; j < 256; j++)
            this.netindex[j] = this.maxnetpos;
    }
    colorMap() {
        let map = [];
        let index = new Array(this.netsize);
        for (let i = 0; i < this.netsize; i++) {
            index[this.network[i][3]] = i;
        }
        let k = 0;
        for (let l = 0; l < this.netsize; l++) {
            let j = index[l];
            map[k++] = (this.network[j][0]);
            map[k++] = (this.network[j][1]);
            map[k++] = (this.network[j][2]);
        }
        return map;
    }
    map(b, g, r) {
        let i = this.netindex[g];
        let j = i - 1;
        let dist;
        let a;
        let bestd = 1000;
        let p;
        let best = -1;
        while ((i < this.netsize) || (j >= 0)) {
            if (i < this.netsize) {
                p = this.network[i];
                dist = p[1] - g;
                if (dist >= bestd) {
                    i = this.netsize;
                }
                else {
                    i++;
                    if (dist < 0)
                        dist = -dist;
                    a = p[0] - b;
                    if (a < 0)
                        a = -a;
                    dist += a;
                    if (dist < bestd) {
                        a = p[2] - r;
                        if (a < 0)
                            a = -a;
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
            if (j >= 0) {
                p = this.network[j];
                dist = g - p[1];
                if (dist >= bestd) {
                    j = -1;
                }
                else {
                    j--;
                    if (dist < 0)
                        dist = -dist;
                    a = p[0] - b;
                    if (a < 0)
                        a = -a;
                    dist += a;
                    if (dist < bestd) {
                        a = p[2] - r;
                        if (a < 0)
                            a = -a;
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
        }
        return (best);
    }
    process() {
        this.learn();
        this.unbiasnet();
        this.inxbuild();
        return this.colorMap();
    }
}
