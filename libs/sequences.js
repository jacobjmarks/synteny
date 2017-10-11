const ensembl = require("./ensembl.js");
const ensemblGenomes = require("./ensemblGenomes.js");

module.exports.pullAndCompareAll = function(req_list, use_bloom, callback) {
    pull(req_list, (sequences) => {
        let match_matrix = [];
        for (let i = 0; i < sequences.length - 1; i++) {
            match_matrix.push(new Array(sequences.length).fill(null));
            for (let j = i + 1; j < sequences.length; j++) {
                match_matrix[i][j] = (use_bloom) ? compareBloom(sequences[i], sequences[j]) : compare(sequences[i], sequences[j]);
                console.log(`${i} ${j}\t${match_matrix[i][j]}`);
            }
        }
        callback(match_matrix);
    })
}

function pull(req_list, callback) {
    let seqs = new Array(req_list.length).fill("");
    for (let i = 0; i < req_list.length; i++) {
        let req = req_list[i];
        let cb = (results) => {
            seqs[i] += results.map((result) => result.seq).reduce((a, b) => a.concat(b));
            let all_seqs_set = seqs.map((seq) => seq != "").reduce((a, b) => a && b)
            if (all_seqs_set) {
                callback(seqs);
            }
        };
        (req.division === "Ensembl") ? ensembl.sequence_region(req.species, req.karyotypes, cb) : ensemblGenomes.sequence_region(req.species, req.karyotypes, cb);
    }
}

function compare(seqA, seqB) {
    const min_kmer_length = 4;
    let common_kmers = 0;
    for (let kmer_len = seqA.length; kmer_len >= min_kmer_length; kmer_len--) {
        for (let i = 0; i <= seqA.length - kmer_len; i++) {
            let kmer = seqA.substr(i, kmer_len);
            if (kmer.indexOf('N') !== -1) { break }
            let searchIndex = 0;
            while (seqB.indexOf(kmer, searchIndex) !== -1) {
                let index = seqB.indexOf(kmer, searchIndex);
                common_kmers++;
                searchIndex = index + 1;
            }
        }
    }
    return common_kmers;
}

function compareBloom(seqA, seqB) {
    let a = seqToIntArray(seqA);
    let b = seqToIntArray(seqB);

    const countBits = function(n) {
        let count = 0;
        while (n !== 0) {
            count++;
            n &= (n - 1);
        }
        return count;
    }
    
    let totalMatches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        let match = a[i] & b[i];
        let filtered = (match | (match >>> 2)) & 0x11111111;
        totalMatches += countBits(filtered);
    }

    return totalMatches;
}

function seqToIntArray(seq) {
    let seqBytes = Math.ceil(seq.length / 2);
    let seqBuffer = new ArrayBuffer(seqBytes);
    let uint8view = new Uint8Array(seqBuffer);

    const lookup = function(nucleotide) {
        switch (nucleotide) {
            case 'A': return (0b1000)
            case 'C': return (0b0100)
            case 'G': return (0b0010)
            case 'T': return (0b0001)
            case 'N': return (0b0000)
        }
    }

    for (let i = 0, len = uint8view.length; i < len; i++) {
        uint8view[i] = lookup(seq[i * 2]) << 4;
        uint8view[i] |= lookup(seq[i * 2 + 1]);
    }

    return new Uint32Array(seqBuffer);
}