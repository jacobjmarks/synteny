const ensembl = require("./ensembl.js");
const ensemblGenomes = require("./ensemblGenomes.js");

module.exports.pullAndCompare = function(req_list, callback) {
    pull(req_list, (sequences) => {
        callback(sequences);
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