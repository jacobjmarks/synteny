const ensembl = require("./ensembl.js");
const ensemblGenomes = require("./ensemblGenomes.js");

module.exports.pullAndCompareAll = function(req_list, callback) {
    pull(req_list, (sequences) => {
        let match_matrix = [];
        for (let i = 0; i < sequences.length - 1; i++) {
            match_matrix.push(new Array(sequences.length).fill(null));
            for (let j = i + 1; j < sequences.length; j++) {
                match_matrix[i][j] = compare(sequences[i], sequences[j]);
                console.log(`${i} ${j}\t${match_matrix[i][j]}`);
            }
        }
        callback(match_matrix);
    })
}

function pull(req_list, callback) {
    let seqs = new Array(req_list.length).fill(undefined);
    for (let i = 0; i < req_list.length; i++) {
        let req = req_list[i];
        let cb = (sequence) => {
            seqs[i] = sequence;
            let all_seqs_set = seqs.map((seq) => seq != undefined).reduce((a, b) => a && b);
            if (all_seqs_set) {
                callback(seqs);
            }
        };
        (req.division === "Ensembl") ? ensembl.sequence_region(req.species, req.karyotype, cb) : ensemblGenomes.sequence_region(req.species, req.karyotype, cb);
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