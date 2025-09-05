export class NeuQuant {
  prime1: number;
  prime2: number;
  prime3: number;
  prime4: number;
  minpicturebytes: number;
  maxnetpos: number;

  netbiasshift: number;
  netsize: number;
  ncycles: number;

  network: number[][];
  netindex: number[];

  intbiasshift: number;
  intbias: number;

  gammashift: number;
  gamma: number;
  betashift: number;
  beta: number;
  betagamma: number;

  initrad: number;
  radiusbiasshift: number;
  radiusbias: number;
  initradius: number;
  radiusdec: number;

  alphabiasshift: number;
  initalpha: number;
  alphadec: number | undefined;

  radbiasshift: number;
  radbias: number;
  alpharadbshift: number;
  alpharadbias: number;

  picture: number[];
  lengthcount: number;
  samplefac: number;

  bias: number[];

  freq: number[];
  radpower: number[];

  constructor(thepic: number[], len: number, sample: number) {
    this.netsize = 256; /* number of colours used */

    /* four primes near 500 - assume no image has a length so large */
    /* that it is divisible by all four primes */
    this.prime1 = 499;
    this.prime2 = 491;
    this.prime3 = 487;
    this.prime4 = 503;
    this.minpicturebytes = 3 * this.prime4; /* minimum size for input image */

    /*
     * Program Skeleton ---------------- [select samplefac in range 1..30] [read
     * image from input file] pic = (unsigned char*) malloc(3*width*height);
     * initnet(pic,3*width*height,samplefac); learn(); unbiasnet(); [write output
     * image header, using writecolourmap(f)] inxbuild(); write output image using
     * inxsearch(b,g,r)
     */

    /*
     * Network Definitions -------------------
     */

    this.maxnetpos = this.netsize - 1;
    this.netbiasshift = 4; /* bias for colour values */
    this.ncycles = 100; /* no. of learning cycles */

    /* defs for freq and bias */
    this.intbiasshift = 16;
    this.intbias = 1 << this.intbiasshift;
    this.gammashift = 10; /* gamma = 1024 */
    this.gamma = 1 << this.gammashift;
    this.betashift = 10;
    this.beta = this.intbias >> this.betashift; /* beta = 1/1024 */
    this.betagamma = this.intbias << (this.gammashift - this.betashift);

    /* defs for decreaseing radius factor */
    this.initrad = this.netsize >> 3; /* for 256 cols, radius starts */
    this.radiusbiasshift = 6;
    this.radiusbias = 1 << this.radiusbiasshift;
    this.initradius = this.initrad * this.radiusbias;
    this.radiusdec = 30; /*factor of 1/30 each cycle */

    /* defs for decreasing alpha factor */
    this.alphabiasshift = 10; /* alpha starts at 1.0 */
    this.initalpha = 1 << this.alphabiasshift;
    this.alphadec = undefined; /* biased by 10 bits */

    /* radbias and alpharadbias used for radpower calculation */
    this.radbiasshift = 8;
    this.radbias = 1 << this.radbiasshift;
    this.alpharadbshift = this.alphabiasshift + this.radbiasshift;
    this.alpharadbias = 1 << this.alpharadbshift;

    /*
     * Types and Global states ---------
     */

    this.picture = thepic; /* the input image itself */
    this.lengthcount = len; /* lengthcount = H*W*3 */
    this.samplefac = sample; /* sampling factor 1..30 */

    // typedf int pixel[4]; /* BGRc */
    this.network = new Array(
      this.netsize,
    ); /* the network itself - [netsize][4] */
    this.netindex = [];

    /* for network lookup - really 256 */
    this.bias = [];

    /* bias and freq arrays for learning */
    this.freq = [];
    this.radpower = [];

    let p;
    for (let i = 0; i < this.netsize; i++) {
      this.network[i] = new Array(4);
      p = this.network[i];
      p[0] = p[1] = p[2] = (i << (this.netbiasshift + 8)) / this.netsize;
      this.freq[i] = this.intbias / this.netsize; /* 1/netsize */
      this.bias[i] = 0;
    }
  }

  /*
   * Main Learning Loop ------------------
   */

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

    if (this.lengthcount < this.minpicturebytes) this.samplefac = 1;

    this.alphadec = 30 + (this.samplefac - 1) / 3;
    p = this.picture;
    pix = 0;
    lim = this.lengthcount;
    samplepixels = this.lengthcount / (3 * this.samplefac);
    delta = (samplepixels / this.ncycles) | 0;
    alpha = this.initalpha;
    radius = this.initradius;

    rad = radius >> this.radiusbiasshift;
    if (rad <= 1) rad = 0;

    for (let i = 0; i < rad; i++)
      this.radpower[i] =
        alpha * (((rad * rad - i * i) * this.radbias) / (rad * rad));

    if (this.lengthcount < this.minpicturebytes) step = 3;
    else if (this.lengthcount % this.prime1 !== 0) step = 3 * this.prime1;
    else {
      if (this.lengthcount % this.prime2 !== 0) step = 3 * this.prime2;
      else {
        if (this.lengthcount % this.prime3 !== 0) step = 3 * this.prime3;
        else step = 3 * this.prime4;
      }
    }
    let i = 0;
    while (i < samplepixels) {
      b = (p[pix + 0] & 0xff) << this.netbiasshift;
      g = (p[pix + 0] & 0xff) << this.netbiasshift;
      r = (p[pix + 0] & 0xff) << this.netbiasshift;

      j = this.contest(b, g, r);

      this.altersingle(alpha, j, b, g, r);
      if (rad !== 0) this.alterneight(rad, j, b, g, r); /* alter neighbours */

			pix += step;
			if(pix >= lim) pix -= this.lengthcount;
			
		i++

			if(delta === 0) delta = 1;

		if(i % delta === 0) {
				alpha -= alpha / this.alphadec;
				radius -= radius / this.radiusdec;
				rad = radius >> this.radiusbiasshift;

				if ( rad <= 1) rad = 0;
				
				for(let j = 0; j < rad; j++) this.radpower[j] = alpha * (((rad * rad - j * j) * this.radbias) / (rad * rad));
			}
    }
  }

  alterneight(rad: number, i: number, b: number, g: number, r: number) {
    let j;
    let k;

    let lo;
    let hi;

    let a;
    let m;
    let p;

    lo = i - rad;
    if (lo < -1) lo = -1;

    hi = i + rad;
    if (hi > this.netsize) hi = this.netsize;

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
        } catch (e) {} // prevents 1.3 miscompilation
      }
    }
  }

  /*
   * Move neuron i towards biased (b,g,r) by factor alpha
   * ----------------------------------------------------
   */

  altersingle(alpha: number, i: number, b: number, g: number, r: number) {
    let n = this.network[i];

    /* alter hit neuron */
    n[0] -= (alpha * (n[0] - b)) / this.initalpha;
    n[1] -= (alpha * (n[1] - g)) / this.initalpha;
    n[2] -= (alpha * (n[2] - r)) / this.initalpha;
  }

  /*
   * Search for biased BGR values --------------------
   */

  contest(b: number, g: number, r: number) {
    /* finds closest neuron (min dist) and updates freq */
    /* finds best neuron (min dist-bias) and returns position */
    /* for frequently chosen neurons, freq[i] is high and bias[i] is negative */
    /* bias[i] = gamma*((1/netsize)-freq[i]) */

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
      if (dist < 0) dist = -dist;
      a = n[i] - g;
      if (a < 0) a = -a;
      dist += a;
      a = n[2] - r;
      if (a < 0) a = -a;
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

	/*
	 * Unbias network to give byte values 0..255 and record position i to prepare
	 * for sort
	 * --------------------------------------------------------------------------
	 */

	unbiasnet() {
		for(let i = 0; i < this.netsize; i++) {
			this.network[i][0] >>= this.netbiasshift;
			this.network[i][1] >>= this.netbiasshift;
			this.network[i][2] >>= this.netbiasshift;
			this.network[i][3] = i; /* record colour no */
		}
	}

	inxbuild() {
		// let i;
		// let j;

		let smallpos;
		let smallval;

		let p;
		let q;

		let previouscol = 0;
		let startpos = 0;

		for(let i = 0; i < this.netsize; i++) {
			p = this.network[i];
			smallpos = i;
			smallval = p[1] /* index on g */

			/* find smallest in i..netsize - 1 */
			for(let j = i + 1; j < this.netsize; j++) {
				q = this.network[j];
				if (q[1] < smallval) { /* index on g */
					smallpos = j;
					smallval = q[1]; /* index on g */
				}
			}
			q = this.network[smallpos];

			/* swap p (i) and q (smallpos) entries */
			if (i !== smallpos) {
				let j = q[0]
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

			/* smallval entry is now in position i */

			if(smallval !== previouscol) {
				this.netindex[previouscol] = (startpos + i) >> 1;

				for(let j = previouscol + 1; j < smallval; j++) this.netindex[j] = i;

				previouscol = smallval;
				startpos = i;
			}
		}

		this.netindex[previouscol] = (startpos + this.maxnetpos) >> 1;

		for(let j = previouscol + 1; j < 256; j++) this.netindex[j] = this.maxnetpos; /* really 256 */
	}

	colorMap () {

		let map = [];
		let index = new Array(this.netsize);

		for(let i = 0; i < this.netsize; i++) {
			index[this.network[i][3]] = i;
		}

		let k = 0;
		for(let l = 0; l < this.netsize; l++) {
			let j = index[l];
			map[k++] = (this.network[j][0]);
			map[k++] = (this.network[j][1]);
			map[k++] = (this.network[j][2]);
		}

		return map;
	}

	map(b: number, g: number, r: number) {
		let i = this.netindex[g]; /* index on g */
		let j = i - 1; /* start at netindex[g] and work outwards */
		let dist;
		let a;
		let bestd = 1000; /* biggest possible dist is 256*3 */
		let p;
		let best = -1;

		while((i < this.netsize) || (j >= 0)) {
			if( i < this.netsize) {
				p = this.network[i];
				dist = p[1] - g; /* int key */

				if(dist >= bestd) {
					i = this.netsize; /* stop iter */
				} else {
					i++;
					if(dist < 0) dist = -dist;
				a = p[0] - b;
					if(a < 0) a = -a;
				dist += a;

					if(dist < bestd) {
						a = p[2] - r;
						if(a < 0) a = -a;
					dist += a;

						if(dist < bestd) {
							bestd = dist;
							best = p[3];
						}
					}
				}
			}

			if(j >= 0) {
				p = this.network[j];
				dist = g - p[1]; /* inx key - reverse dif */

				if(dist >= bestd) {
					j = -1; /* stop iter */
				} else {

					j--;
					if(dist < 0) dist = -dist;
					a = p[0] - b;
					if(a < 0) a = -a;
					dist += a;

					if(dist < bestd) {
						a = p[2] - r;
						if(a < 0) a = -a;
					dist += a;
						if(dist < bestd) {
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
