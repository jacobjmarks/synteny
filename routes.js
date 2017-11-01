const express = require("express");
const router = express.Router();

const ensembl = require("./libs/ensembl.js");
const ensemblGenomes = require("./libs/ensemblGenomes.js");
const sequences = require("./libs/sequences.js");
const database = require("./libs/database.js");

const LOGGING = require("./config.json").serverside_logging;

// Index page.
router.get('/', (req, res) => {
    if (LOGGING) console.log("GET /");
    res.render("index.pug");
})

// Retreive and respond with available Divisions.
router.post("/getDivisions", (req, res) => {
    if (LOGGING) console.log("POST /getDivisions");
    ensemblGenomes.info_divisions((err, divisions) => {
        if (err) {
            if (LOGGING) console.error(err);
            return res.status(500).end();
        }
        res.send(divisions);
    })
})

// Retrieve and respond with available Species for the given Division.
router.post("/getSpecies/:division", (req, res) => {
    let division = req.params.division;
    if (LOGGING) console.log(`POST /getSpecies/${division}`)
    let cb = (err, species) => {
        if (err) {
            if (LOGGING) console.error(err);
            return res.status(500).end();
        }
        res.send(species);
    };
    (division === "Ensembl") ? ensembl.info_species(cb) : ensemblGenomes.info_species(division, cb);
})

// Retrieve and respond with available Karyotypes for the given Species under the given Divsion.
router.post("/getKaryotypes/:division/:species", (req, res) => {
    let division = req.params.division;
    let species = req.params.species;
    if (LOGGING) console.log(`POST /getKaryotypes/${species}`);
    let cb = (err, karyotypes) => {
        if (err) {
            if (LOGGING) console.error(err);
            return res.status(500).end();
        }
        res.send(karyotypes);
    };
    (division === "Ensembl") ? ensembl.info_assembly(species, cb) : ensemblGenomes.info_assembly(species, cb);
})

// Compare the provided sequences and respond with the resulting match matrix.
router.post("/compareSequences", (req, res) => {
    let req_list = JSON.parse(req.body.req_list);
    if (LOGGING) console.log("POST /compareSequences", req_list);

    database.addComparison({
        divisions: req_list.map((req) => req.division),
        species: req_list.map((req) => req.species),
        karyotypes: req_list.map((req) => req.karyotypes)
    }, (err) => {
        if (err) {
            if (LOGGING) console.error(err.stack);
        }
    })

    if (LOGGING) console.log("Comparing...");
    sequences.pullAndCompareAll(req_list, (err, results) => {
        if (err) {
            if (LOGGING) console.error(err);
            return res.status(500).end();
        }
        if (LOGGING) console.log("Done!");
        res.send(results);
    });
})

// Retrieve and respond with recent comparisons.
router.post("/getComparisons", (req, res) => {
    database.comparisons((err, comparisons) => {
        if (err) {
            if (LOGGING) console.error(err);
            return res.status(500).end();
        }
        res.send(comparisons);
    })
})

module.exports = router;