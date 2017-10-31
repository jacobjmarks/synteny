const express = require("express");
const app = express();
const fs = require("fs");
const pug = require("pug");
const bodyParser = require("body-parser");

const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(require('./routes'));

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})

setInterval(() => {
    if(process.memoryUsage().rss > 700000000) {
        console.log("MEMORY LIMIT REACHED");
        process.kill(process.pid, 'SIGKILL');
    }
}, 1000)

// Pug Templates
const dir = "./public/js/templates/";
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
fs.writeFileSync(dir + "listitem.js", pug.compileFileClient("./views/templates/listitem.pug", {name: "pugTemplate_listItem"}));
fs.writeFileSync(dir + "recentreq.js", pug.compileFileClient("./views/templates/recentreq.pug", {name: "pugTemplate_recentreq"}));