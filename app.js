const express = require("express");
const app = express();

const genomeDB = require("./libs/genomeDB.js")

const PORT = 3000;

app.use(express.static("public"));

app.get('/', (req, res) => {
    console.log("GET /");
    genomeDB.info_divisions((divisions) => {
        divisions = JSON.parse(divisions);
        genomeDB.info_species(divisions[0], (species) => {
            res.json(JSON.parse(species));
        })
    })
    // res.render("index.pug");
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})