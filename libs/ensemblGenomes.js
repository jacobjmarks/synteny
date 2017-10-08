const request = require("request");

module.exports.info_divisions = function(callback) {
    request({
        url: "http://rest.ensemblgenomes.org/info/divisions",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        callback(JSON.parse(body));
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
        callback(JSON.parse(body).species);
    })
}