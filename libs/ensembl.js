const request = require("request");

module.exports.info_species = function(callback) {
    request({
        url: "http://rest.ensembl.org/info/species",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        callback(JSON.parse(body).species);
    })
}

module.exports.info_assembly = function(species, callback) {
    request({
        url: `http://rest.ensembl.org/info/assembly/${species}`,
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        callback(JSON.parse(body).karyotype);
    })
}

module.exports.sequence_region = function(species, karyotypes, callback) {
    const seq_length = 1000;
    request({
        url: `http://rest.ensembl.org/sequence/region/${species}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        qs: {
            "regions" : (() => {
                let regions = [];
                for (let i = 0; i < karyotypes.length; i++) {
                    regions.push(`${karyotypes[i]}:0..${seq_length}`)
                }
                return regions;
            })()
        }
    }, (error, response, body) => {
        callback(JSON.parse(body));
    })
}