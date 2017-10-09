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

module.exports.sequence_region = function(species, karyotype, callback) {
    request({
        url: `http://rest.ensembl.org/sequence/region/${species}/${karyotype}:0..1000`,
        method: "GET",
        headers: {
            "Content-Type": "text/plain"
        }
    }, (error, response, body) => {
        callback(body);
    })
}