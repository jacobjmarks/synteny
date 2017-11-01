const request = require("request");

/**
 * Retreive available species.
 * @param {(err?: Error, species: Object)} callback
 */
module.exports.info_species = function(callback) {
    request({
        url: "http://rest.ensembl.org/info/species",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            callback(null, JSON.parse(body).species);
        } else {
            callback(new Error("Error retrieving species."));
        }
    })
}

/**
 * Retrieve available karyotypes for the given species.
 * @param {String} species
 * @param {(err?: Error, karyotypes: Object)} callback
 */
module.exports.info_assembly = function(species, callback) {
    request({
        url: `http://rest.ensembl.org/info/assembly/${species}`,
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            callback(null, JSON.parse(body).karyotype);
        } else {
            callback(new Error("Error retrieving karyotypes."));
        }
    })
}

/**
 * Retrieve sequences based on the given species and their karyotypes.
 * @param {String} species
 * @param {[String]} karyotypes
 * @param {(err?: Error, sequences: Object)} callback
 */
module.exports.sequence_region = function(species, karyotypes, callback) {
    const seq_length = 3000;
    request({
        url: `http://rest.ensembl.org/sequence/region/${species}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        json: {
            "regions" : (() => {
                let regions = [];
                for (let i = 0; i < karyotypes.length; i++) {
                    regions.push(`${karyotypes[i]}:0..${seq_length}`)
                }
                return regions;
            })()
        }
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            callback(null, body);
        } else {
            callback(new Error("Error retrieving sequence."));
        }
    })
}