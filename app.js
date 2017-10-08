const express = require("express");
const app = express();

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
    ensemblGenomes.info_species(division, (genomes) => {
        res.send(genomes);
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})