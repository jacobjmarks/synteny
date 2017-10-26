const express = require("express");
const router = express.Router();

const ensembl = require("./libs/ensembl.js");
const ensemblGenomes = require("./libs/ensemblGenomes.js");
const sequences = require("./libs/sequences.js");
const database = require("./libs/database.js");

router.get('/', (req, res) => {
    console.log("GET /");
    res.render("index.pug");
})

router.post("/getDivisions", (req, res) => {
    console.log("POST /getDivisions");
    ensemblGenomes.info_divisions((err, divisions) => {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }
        res.send(divisions);
    })
})

router.post("/getSpecies/:division", (req, res) => {
    let division = req.params.division;
    console.log(`POST /getSpecies/${division}`)
    let cb = (err, species) => {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }
        res.send(species);
    };
    (division === "Ensembl") ? ensembl.info_species(cb) : ensemblGenomes.info_species(division, cb);
})

router.post("/getKaryotypes/:division/:species", (req, res) => {
    let division = req.params.division;
    let species = req.params.species;
    console.log(`POST /getKaryotypes/${species}`);
    let cb = (err, karyotypes) => {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }
        res.send(karyotypes);
    };
    (division === "Ensembl") ? ensembl.info_assembly(species, cb) : ensemblGenomes.info_assembly(species, cb);
})

router.post("/compareSequences", (req, res) => {
    let req_list = JSON.parse(req.body.req_list);
    let use_bitwise = parseInt(req.body.use_bitwise);
    console.log("POST /compareSequences", req_list);

    database.addComparison({
        divisions: req_list.map((req) => req.division),
        species: req_list.map((req) => req.species),
        karyotypes: req_list.map((req) => req.karyotypes)
    }, (err) => {
        if (err) {
            console.error(err.stack);
        }
    })

    console.log("Comparing...");
    sequences.pullAndCompareAll(req_list, use_bitwise, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }
        console.log("Done!");
        res.send(results);
    });
})

router.post("/getComparisons", (req, res) => {
    database.comparisons((err, comparisons) => {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }
        res.send(comparisons);
    })
})

module.exports = router;