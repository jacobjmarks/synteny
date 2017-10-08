const express = require("express");
const app = express();

const genomeDB = require("./libs/genomeDB.js")

const PORT = 3000;

app.use(express.static("public"));

app.get('/', (req, res) => {
    console.log("GET /");
    // genomeDB.info_divisions((divisions) => {
    //     genomeDB.info_species(divisions[0], (species) => {
    //         res.json(species);
    //     })
    // })
    res.render("index.pug");
})

app.post("/getDivisions", (req, res) => {
    genomeDB.info_divisions((divisions) => {
        res.send(divisions);
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})