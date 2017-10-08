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