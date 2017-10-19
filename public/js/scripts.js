$(document).ready(() => {
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
        let selected_specie = $("#select-species option:checked");
        addToList({
            division: select.divisions.val(),
            species: {
                name: select.species.val(),
                common_name: selected_specie.attr("data-subtext"),
                display_name: selected_specie.html()
            },
            karyotypes: select.karyotypes.val(),
        });
        select.karyotypes.selectpicker("deselectAll");
    })

    btn_done = $("#btn-done");
    btn_done.click(() => {
        compareSequences();
    })

    seq_container = $("#sequences");

    loading = {
        divisions: (isLoading) => {
            if (isLoading) {
                select.divisions.prop("disabled", true);
                select.divisions.selectpicker("refresh");
                spinner.divisions.removeClass("hidden");
                select.divisions.selectpicker("refresh");
            } else {
                select.divisions.prop("disabled", false);
                select.divisions.selectpicker("refresh");
                spinner.divisions.addClass("hidden");
            }
        },
        species: (isLoading) => {
            if (isLoading) {
                spinner.species.removeClass("hidden");
                select.species.empty();
                select.species.prop("disabled", true);
                select.species.selectpicker("refresh");
            
                select.karyotypes.empty();
                select.karyotypes.prop("disabled", true);
                select.karyotypes.selectpicker("refresh");

                btn_add.prop("disabled", true);
            } else {
                select.species.prop("disabled", false);
                select.species.selectpicker("refresh");
                spinner.species.addClass("hidden");
            }
        },
        karyotypes: (isLoading) => {
            if (isLoading) {
                spinner.karyotype.removeClass("hidden");
                select.karyotypes.empty();
                select.karyotypes.prop("disabled", true);
                select.karyotypes.selectpicker("refresh");

                btn_add.prop("disabled", true);
            } else {
                select.karyotypes.prop("disabled", false);
                select.karyotypes.selectpicker("refresh");
                spinner.karyotype.addClass("hidden");
            }
        },
        results: (isLoading) => {
            if (isLoading) {
                btn_done.prop("disabled", true);
                $("#btn-done-check").addClass("hidden");
                $("#btn-done-spinner").removeClass("hidden");
                $(".list-item button").each((i, btn) => $(btn).prop("disabled", true));
                btn_add.prop("disabled", true);
                select.divisions.prop("disabled", true);
                select.species.prop("disabled", true);
                select.karyotypes.prop("disabled", true);
                $("#btn-collapse").prop("disabled", true);
            } else {
                btn_done.prop("disabled", false);
                $("#btn-done-check").removeClass("hidden");
                $("#btn-done-spinner").addClass("hidden");
                $(".list-item button").each((i, btn) => $(btn).prop("disabled", false));
                btn_add.prop("disabled", false);
                select.divisions.prop("disabled", false);
                select.species.prop("disabled", false);
                select.karyotypes.prop("disabled", false);
                $("#btn-collapse").prop("disabled", false);
                setTimeout(() => $("#btn-collapse").click(), 1000);
            }
            select.divisions.selectpicker("refresh");
            select.species.selectpicker("refresh");
            select.karyotypes.selectpicker("refresh");
        }
    }

    $("#btn-collapse").click(() => {
        const down = $("#btn-collapse-down");
        const up = $("#btn-collapse-up");

        if (down.hasClass("hidden")) {
            down.removeClass("hidden");
            up.addClass("hidden");
        } else {
            down.addClass("hidden");
            up.removeClass("hidden");
        }
    })

    populateDivisions();

    recent_comparisons = [];
    getRecentComparisons();
})

function getRecentComparisons() {
    $.ajax({
        url: "/getComparisons",
        method: "POST"
    })
    .done((comparisons) => {
        recent_comparisons = comparisons;
        updateRecentComparisons();
    })
}

function updateRecentComparisons() {
    for (let i = 0; i < recent_comparisons.length; i++) {
        let c = recent_comparisons[i];

        let item = $(pugTemplate_recentreq({
            date: new Date(c.date_posted).toLocaleString()
        }));
        $(item).find("button").click(() => {
            viewRecent(c);
        });

        $("#recent-container").append(item);
    }
}

function viewRecent(comparison) {
    req_list = [];
    for (let i = 0; i < comparison.divisions.length; i++) {
        req_list.push({
            division: comparison.divisions[i],
            species: {
                name: comparison.species[i].name,
                common_name: comparison.species[i].common_name,
                display_name: comparison.species[i].display_name
            },
            karyotypes: comparison.karyotypes[i],
        });
    }
    updateList();
}

function populateDivisions() {
    loading.divisions(true);
    $.ajax({
        url: "/getDivisions",
        method: "POST"
    })
    .done((divisions) => {
        select.divisions.append(`<option>Ensembl</option>`)
        for (let i = 0; i < divisions.length; i++) {
            select.divisions.append(`<option value="${divisions[i]}">${divisions[i]}</option>`)
        }
        loading.divisions(false);
    })
}

function populateSpecies(division) {
    loading.species(true);
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
        loading.species(false);
    })
}

function populateKaryotypes(division, species) {
    loading.karyotypes(true);
    $.ajax({
        url: `/getKaryotypes/${division}/${species}`,
        method: "POST"
    })
    .done((karyotypes) => {
        console.log(karyotypes);
        for (let i = 0; i < karyotypes.length; i++) {
            select.karyotypes.append(`<option value="${karyotypes[i]}">${karyotypes[i]}</option>`)
        }
        loading.karyotypes(false);
    })
}

function updateList() {
    list_div.empty();
    for (let i = 0; i < req_list.length; i++) {
        let item = $(pugTemplate_listItem({
            index: alphabet[i],
            item: req_list[i]
        }));
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
    loading.results(true);
    seq_container.empty();
    $.ajax({
        url: "/compareSequences",
        method: "POST",
        data: {
            req_list: JSON.stringify(req_list),
            use_bitwise: ($("#bitwise-switch").prop("checked")) ? 1 : 0
        }
    })
    .done((match_matrix) => {
        drawChart(match_matrix);
        loading.results(false);
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
                    a_alpha_index: alphabet[i],
                    a_name: req_list[i].species.display_name,
                    a_karyotypes: req_list[i].karyotypes,
                    b_alpha_index: alphabet[j],
                    b_name: req_list[j].species.display_name,
                    b_karyotypes: req_list[j].karyotypes,
                    matches: datum
                })

                $("#matrix-div").append(`<p>${alphabet[i]} ${alphabet[j]}\t${datum}</p>`)
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
        .style("white-space", "nowrap")
        .style("width", "min-content")
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
        .on("mouseover", (d, i) => 
            tooltip.html(
                `${d.a_name}:${d.a_karyotypes.join(",")} | ${d.b_name}:${d.b_karyotypes.join(",")}<br>${d.matches}`
            ).style("visibility", "visible"))
        .on("mousemove", () => tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px"))
        .on("mouseout", () => tooltip.style("visibility", "hidden"))

    nodes.append("text")
        .text((d) => (d.matches > 0) ? `${d.a_alpha_index} | ${d.b_alpha_index}` : "")
        .style("fill", (d) => textColor(d.matches))
    
    d3.forceSimulation(data)
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("collide", d3.forceCollide().radius((d) => calcDrawRadius(d.matches) + 5))
        .on("tick", () => {
            nodes.attr("transform", (d) => `translate(${[d.x + width/2, d.y + height/2]})`)
        })
}