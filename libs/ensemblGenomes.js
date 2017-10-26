const request = require("request");

module.exports.info_divisions = function(callback) {
    request({
        url: "http://rest.ensemblgenomes.org/info/divisions",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            callback(null, JSON.parse(body));
        } else {
            callback(new Error("Error retrieving divisions."));
        }
    })
}

module.exports.info_species = function(division, callback) {
    request({
        url: "http://rest.ensemblgenomes.org/info/species",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        qs: {
            "division": division
        }
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            callback(null, JSON.parse(body).species);
        } else {
            callback(new Error("Error retrieving species."));
        }
    })
}

module.exports.info_assembly = function(species, callback) {
    request({
        url: `http://rest.ensemblgenomes.org/info/assembly/${species}`,
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

module.exports.sequence_region = function(species, karyotypes, callback) {
    const seq_length = 3000;
    request({
        url: `http://rest.ensemblgenomes.org/sequence/region/${species}`,
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