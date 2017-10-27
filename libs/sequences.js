const ensembl = require("./ensembl.js");
const ensemblGenomes = require("./ensemblGenomes.js");

module.exports.pullAndCompareAll = function(req_list, callback) {
    pull(req_list, (err, sequences) => {
        if (err) {
            return callback(err);
        }
        
        let count = 0;
        let toCompare = (sequences.length * (sequences.length - 1)) / 2;
        let match_matrix = [];
        for (let i = 0; i < sequences.length - 1; i++) {
            match_matrix.push(new Array(sequences.length).fill(null));
            for (let j = i + 1; j < sequences.length; j++) {
                compare(sequences[i], sequences[j], (result) => {
                    match_matrix[i][j] = result;
                    console.log(`${i} ${j}\t${match_matrix[i][j]}`);

                    count++;
                    if (count === toCompare) {
                        callback(null, match_matrix);
                    }
                })
            }
        }
    })
}

function pull(req_list, callback) {
    let seqs = new Array(req_list.length).fill("");
    let error = false;
    for (let i = 0; i < req_list.length; i++) {
        let req = req_list[i];
        let cb = (err, results) => {
            if (err) {
                if (!error) {
                    error = true;
                    return callback(err);
                }
            }
            try {
                seqs[i] += results.map((result) => result.seq).reduce((a, b) => a.concat(b));
            } catch (e) {
                if (!error) {
                    error = true;
                    return callback(new Error("Error passing API response."));
                }
            }
            let all_seqs_set = seqs.map((seq) => seq != "").reduce((a, b) => a && b)
            if (all_seqs_set) {
                callback(null, seqs);
            }
        };
        (req.division === "Ensembl") ?
            ensembl.sequence_region(req.species.name, req.karyotypes, cb)
            : ensemblGenomes.sequence_region(req.species.name, req.karyotypes, cb);
    }
}

const Worker = require('webworker-threads').Worker;

function compare(seqA, seqB, callback) {
    let workerboi = new Worker(function() {
        function work (seqs) {
            let seqA = seqs.seqA;
            let seqB = seqs.seqB;
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
        this.onmessage = function (event) {
            postMessage(work(event.data));
        }
      });
      workerboi.onmessage = function (event) {
          callback(event.data);
          workerboi.terminate();
      };
      workerboi.postMessage({seqA: seqA, seqB: seqB});
}