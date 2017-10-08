const express = require("express");
const app = express();

const genomeDB = require("./libs/genomeDB.js")

const PORT = 3000;

app.use(express.static("public"));

app.get('/', (req, res) => {
    console.log("GET /");
    res.render("index.pug");
})

app.post("/getDivisions", (req, res) => {
    console.log("POST /getDivisions");
    genomeDB.info_divisions((divisions) => {
        res.send(divisions);
    })
})

app.post("/getGenomes/:division", (req, res) => {
    let division = req.params.division;
    console.log(`POST /getGenomes/${division}`)
    genomeDB.info_species(division, (genomes) => {
        res.send(genomes);
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})