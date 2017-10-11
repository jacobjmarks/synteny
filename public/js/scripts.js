$(document).ready(() => {
    spinner = {
        divisions: $("#spinner-divisions"),
        species: $("#spinner-species"),
        karyotype: $("#spinner-karyotype")
    }

    select = {
        divisions: $("#select-divisions"),
        species: $("#select-species"),
        karyotypes: $("#select-karyotypes")
    }

    select.divisions.change(() => {
        populateSpecies(select.divisions.val());
    })
    
    select.species.change(() => {
        populateKaryotypes(select.divisions.val(), select.species.val());
    })
    
    select.karyotypes.change(() => {
        btn_add.prop("disabled", false);
    })

    list_div = $("#list");
    req_list = [];

    btn_add = $("#btn-add");
    btn_add.click(() => {
        addToList({
            division: select.divisions.val(),
            species: select.species.val(),
            karyotypes: select.karyotypes.val()
        });
        select.karyotypes.selectpicker("deselectAll");
    })

    btn_done = $("#btn-done");
    btn_done.click(() => {
        compareSequences();
    })

    seq_container = $("#sequences");

    populateDivisions();
})

function populateDivisions() {
    spinner.divisions.removeClass("hidden");
    $.ajax({
        url: "/getDivisions",
        method: "POST"
    })
    .done((divisions) => {
        select.divisions.append(`<option>Ensembl</option>`)
        for (let i = 0; i < divisions.length; i++) {
            select.divisions.append(`<option value="${divisions[i]}">${divisions[i]}</option>`)
        }        
        select.divisions.selectpicker("refresh");
        spinner.divisions.addClass("hidden");
    })
}

function populateSpecies(division) {
    spinner.species.removeClass("hidden");
    select.species.empty();
    select.species.prop("disabled", true);
    select.species.selectpicker("refresh");

    select.karyotypes.empty();
    select.karyotypes.prop("disabled", true);
    select.karyotypes.selectpicker("refresh");
    
    btn_add.prop("disabled", true);

    $.ajax({
        url: `/getSpecies/${division}`,
        method: "POST"
    })
    .done((species) => {
        species.sort((a, b) => a.display_name.localeCompare(b.display_name));
        console.log(species);
        for (let i = 0; i < species.length; i++) {
            let s = species[i];
            select.species.append(`<option value="${s.name}" data-subtext="${s.common_name ? s.common_name : ''}">${s.display_name}</option>`)
        }

        select.species.prop("disabled", false);
        select.species.selectpicker("refresh");
        spinner.species.addClass("hidden");
    })
}

function populateKaryotypes(division, species) {
    spinner.karyotype.removeClass("hidden");
    select.karyotypes.empty();
    select.karyotypes.prop("disabled", true);
    select.karyotypes.selectpicker("refresh");

    btn_add.prop("disabled", true);

    $.ajax({
        url: `/getKaryotypes/${division}/${species}`,
        method: "POST"
    })
    .done((karyotypes) => {
        console.log(karyotypes);
        for (let i = 0; i < karyotypes.length; i++) {
            select.karyotypes.append(`<option value="${karyotypes[i]}">${karyotypes[i]}</option>`)
        }

        select.karyotypes.prop("disabled", false);
        select.karyotypes.selectpicker("refresh");
        spinner.karyotype.addClass("hidden");
    })
}

function updateList() {
    list_div.empty();
    for (let i = 0; i < req_list.length; i++) {
        let item = $(pugTemplate_listItem({item: req_list[i]}));
        $(item).find("button").click(() => {
            req_list.splice(i, 1);
            updateList();
        })

        list_div.append(item);
    }
    
    if (req_list.length > 0) {
        btn_done.removeClass("hidden");
    } else {
        btn_done.addClass("hidden");
    }
}

function addToList(selection) {
    req_list.push(selection);
    updateList();
}

function compareSequences() {
    seq_container.empty();
    $.ajax({
        url: "/compareSequences",
        method: "POST",
        data: {
            req_list: JSON.stringify(req_list)
        }
    })
    .done((match_matrix) => {
        drawChart(match_matrix);
    })
}

function drawChart(match_matrix) {
    console.log(match_matrix);
    $("#chart").empty();
    $("#matrix-div").empty();
    let data = [];
    // let minMatches = Number.MAX_SAFE_INTEGER;
    let maxMatches = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < match_matrix.length; i++) {
        for (let j = 0; j < match_matrix[i].length; j++) {
            let datum = match_matrix[i][j];
            if (datum != null) {
                if (datum > maxMatches) {maxMatches = datum}
                // if (datum < minMatches) {minMatches = datum}
                data.push({
                    i: i,
                    j: j,
                    matches: datum
                })

                $("#matrix-div").append(`<p>${i} ${j}\t${datum}</p>`)
            }
        }
    }

    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "#626D71")
        .style("border-radius", "6px")
        .style("text-align", "center")
        .style("font-family", "monospace")
        .style("width", "100px")
        .text("");

    let svg = d3.select("#chart"),
        width = $("#chart").width(),
        height = $("#chart").height()
        
    let header_height = $("#header").height();

    d3.select("#matrix-div").attr("transform", `translate(${[0, header_height]})`)

    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, maxMatches]);
    const textColor = d3.scaleSequential(d3.interpolateGreys).domain([maxMatches, 0]);

    let nodes = svg.selectAll(".node").data(data).enter().append("g");

    const calcDrawRadius = function(matches) {
        const minRadius = 15;
        const maxRadius = 100;
        return minRadius + (matches / maxMatches) * (maxRadius - minRadius);
    }

    nodes.append("circle")
        .attr("r", (d) => (d.matches > 0) ? calcDrawRadius(d.matches) : 0)
        .style("fill", (d) => color(d.matches))
        .on("mouseover", (d) => tooltip.html(`${d.i} | ${d.j}<br>${d.matches}`).style("visibility", "visible"))
        .on("mousemove", () => tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px"))
        .on("mouseout", () => tooltip.style("visibility", "hidden"))

    nodes.append("text")
        .text((d) => (d.matches > 0) ? `${d.i} | ${d.j}` : "")
        .style("fill", (d) => textColor(d.matches))
    
    d3.forceSimulation(data)
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("collide", d3.forceCollide().radius((d) => calcDrawRadius(d.matches) + 5))
        .on("tick", () => {
            nodes.attr("transform", (d) => `translate(${[d.x + width/2, d.y + height/2 + header_height/2]})`)
        })
}