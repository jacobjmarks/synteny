const express = require("express");
const app = express();

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

app.post("/getGenomes/:division", (req, res) => {
    let division = req.params.division;
    console.log(`POST /getGenomes/${division}`)
    let cb = (genomes) => {res.send(genomes)};
    (division === "Ensembl") ? ensembl.info_species(cb) : ensemblGenomes.info_species(division, cb);
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})