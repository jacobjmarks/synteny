const express = require("express");
const app = express();
const fs = require("fs");
const pug = require("pug");
const bodyParser = require("body-parser");

const ensembl = require("./libs/ensembl.js");
const ensemblGenomes = require("./libs/ensemblGenomes.js");
const sequences = require("./libs/sequences.js");

const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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

app.post("/compareSequences", (req, res) => {
    let req_list = JSON.parse(req.body.req_list);
    let use_bitwise = parseInt(req.body.use_bitwise);
    console.log("POST /compareSequences", req_list);
    sequences.pullAndCompareAll(req_list, use_bitwise, (results) => {
        res.send(results);
    });
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})

// Pug Templates
fs.writeFileSync("./public/js/templates/listitem.js", pug.compileFileClient("./views/templates/listitem.pug", {name: "pugTemplate_listItem"}));