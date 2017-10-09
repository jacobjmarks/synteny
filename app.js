const express = require("express");
const app = express();
const fs = require("fs");
const pug = require("pug");

const ensembl = require("./libs/ensembl.js")
const ensemblGenomes = require("./libs/ensemblGenomes.js")

const PORT = 3000;

app.use(express.static("public"));

app.get('/', (req, res) => {
    console.log("GET /");
    res.render("index.pug");
})

app.post("/getDivisions", (req, res) => {
    console.log("POST /getDivisions");
    ensemblGenomes.info_divisions((divisions) => {
        res.send(divisions);
    })
})

app.post("/getSpecies/:division", (req, res) => {
    let division = req.params.division;
    console.log(`POST /getSpecies/${division}`)
    let cb = (species) => {res.send(species)};
    (division === "Ensembl") ? ensembl.info_species(cb) : ensemblGenomes.info_species(division, cb);
})

app.post("/getKaryotypes/:division/:species", (req, res) => {
    let division = req.params.division;
    let species = req.params.species;
    console.log(`POST /getKaryotypes/${species}`);
    let cb = (karyotypes) => {res.send(karyotypes)};
    (division === "Ensembl") ? ensembl.info_assembly(species, cb) : ensemblGenomes.info_assembly(species, cb);
})

app.post("/getSequence/:division/:species/:karyotype", (req, res) => {
    let division = req.params.division;
    let species = req.params.species;
    let karyotype = req.params.karyotype;
    console.log(`POST /getSequence/${species}/${karyotype}`);
    let cb = (sequence) => {res.send(sequence)};
    (division === "Ensembl") ? ensembl.sequence_region(species, karyotype, cb) : ensemblGenomes.sequence_region(species, karyotype, cb);
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})

// Pug Templates
fs.writeFileSync("./public/js/templates/listitem.js", pug.compileFileClient("./views/templates/listitem.pug", {name: "pugTemplate_listItem"}));