$(document).ready(() => {
    populateDivisions();

    $("#select-divisions").change(() => {
        populateSpecies($("#select-divisions").val());
    })
    
    $("#select-species").change(() => {
        populateAssembly($("#select-divisions").val(), $("#select-species").val());
    })
    
    $("#select-assembly").change(() => {
        
    })

    // const NUM_SEQS = 3;
    // let alphabet = "ACGT";

    // for (let i = 0; i < NUM_SEQS; i++) {
    //     let seq = "";
    //     let seq_len = 250;
    //     for (let j = 0; j < seq_len; j++) {
    //         seq += alphabet[Math.floor(Math.random() * 4)];
    //     }
    //     SEQUENCES.push(seq);
    // }

    // popup = d3.select("body").append("div")	
    //     .attr("class", "tooltip")
    //     .style("background-color", "white")
    //     .style("border", "1px solid black")
    //     .style("border-radius", "3px")
    //     .style("padding", "2px 5px")
    //     .style("opacity", 0)
            
    // drawSequences();
    // drawLinks();
})

function populateDivisions() {
    $.ajax({
        url: "/getDivisions",
        method: "POST"
    })
    .done((divisions) => {
        let select = $("#select-divisions");
        select.append(`<option>Ensembl</option>`)
        for (let i = 0; i < divisions.length; i++) {
            select.append(`<option value="${divisions[i]}">${divisions[i]}</option>`)
        }
        select.selectpicker("refresh");
    })
}

function populateSpecies(division) {
    $.ajax({
        url: `/getSpecies/${division}`,
        method: "POST"
    })
    .done((species) => {
        species.sort((a, b) => a.display_name.localeCompare(b.display_name));
        console.log(species);
        let select = $("#select-species");
        select.empty();
        for (let i = 0; i < species.length; i++) {
            let s = species[i];
            select.append(`<option value="${s.name}" data-subtext="${s.common_name ? s.common_name : ''}">${s.display_name}</option>`)
        }
        select.selectpicker("refresh");
    })
}

function populateAssembly(division, species) {
    $.ajax({
        url: `/getAssembly/${division}/${species}`,
        method: "POST"
    })
    .done((karyotype) => {
        // species.sort((a, b) => a.display_name.localeCompare(b.display_name));
        console.log(karyotype);
        let select = $("#select-assembly");
        select.empty();
        for (let i = 0; i < karyotype.length; i++) {
            select.append(`<option value="${karyotype[i]}">${karyotype[i]}</option>`)
        }
        select.selectpicker("refresh");
    })
}

const SEQUENCES = [];
const MIN_KMER = 6;

function compare(seqA, seqB) {
    let kmers = [];

    for (let kmer_len = seqA.length; kmer_len >= MIN_KMER; kmer_len--) {
        for (let i = 0; i <= seqA.length - kmer_len; i++) {
            let kmer = seqA.substr(i, kmer_len);
            let searchIndex = 0;
            while (seqB.indexOf(kmer, searchIndex) !== -1) {
                let index = seqB.indexOf(kmer, searchIndex);
                kmers.push({
                    value: kmer,
                    source: {
                        start: i,
                        end: i + kmer_len - 1
                    },
                    target: {
                        start: index,
                        end: index + kmer_len - 1
                    }
                });
                searchIndex = index + 1;
            }
        }
    }
    return kmers;
}

function drawSequences() {
    let container = d3.select("#seq-container");
    
    container
    .selectAll("div")
    .data(SEQUENCES)
    .enter().each((seq, i) => {
        let seq_div = container
            .append("div").classed("row", true)
            .append("div").classed("col", true).classed("seq-col", true)
            .append("div").classed("w-100", true)
                .classed("sequence", true)
                .classed("seq-" + i, true)
        for (let i = 0; i < seq.length; i++) {
            let seg_width = $(".sequence" + i).width() / seq.length;
            seq_div.append("div")
                .classed("seq-seg", true)
                .classed("seg-" + seq[i].toUpperCase(), true)
                .style("width", seq.length / 100 + "%")
                .style("height", 30)
                // .on("mouseover", () => {
                //     popup.transition()
                //          .duration(200)
                //          .style("opacity", .9);
                //     popup.html(seq[i])
                //          .style("left", (d3.event.pageX - 15) + "px")
                //          .style("top", (d3.event.pageY - 30) + "px");
                // })
                // .on("mouseout", function(d) {
                //     popup.transition()
                //          .duration(500)
                //          .style("opacity", 0);
                // })
        }
    })
}

function clearLinks() {
    $("svg").remove();
}

function drawLinks() {
    let seqs = d3.selectAll(".sequence").nodes();

    for (let i = 0; i < seqs.length - 1; i++) {
        let svg = d3.select(d3.selectAll(".seq-col").nodes()[i])
            .append("svg")
            .style("width", "100%")
        for (let j = i + 1; j < seqs.length; j++) {
            let matches = compare(SEQUENCES[i], SEQUENCES[j]);
            
            let seqA = seqs[i];
            let seqB = seqs[j];
            let segsA = d3.select(seqA).selectAll(".seq-seg").nodes();
            let segsB = d3.select(seqB).selectAll(".seq-seg").nodes();

            let areaData = [];

            for (let k = 0; k < matches.length; k++) {
                let sourceStart = segsA[matches[k].source.start];
                let sourceEnd = segsA[matches[k].source.end];
                let targetStart = segsB[matches[k].target.start];
                let targetEnd = segsB[matches[k].target.end];

                let ssPos = $(sourceStart).position();
                let sePos = $(sourceEnd).position();
                let tsPos = $(targetStart).position();
                let tePos = $(targetEnd).position();

                let link_seq_offset = 0;
                let seq_height = $(seqs[0]).height();
                let svg_height = $("svg").height();

                areaData.push([
                    [ssPos.left, 0 - seq_height],
                    [ssPos.left, link_seq_offset],
                    [tsPos.left, svg_height - link_seq_offset],
                    [tsPos.left, svg_height + seq_height],
                    [tePos.left, svg_height + seq_height],
                    [tePos.left, svg_height - link_seq_offset],
                    [sePos.left, link_seq_offset],
                    [sePos.left, 0 - seq_height]
                ])
            }

            svg.selectAll("path.area")
            .data(areaData).enter()
            .append("path")
                .classed("area", true)
                .style("opacity", "0.2")
                .attr("fill", "blue")
                .attr("d", d3.area().curve(d3.curveMonotoneY))
                .on("mouseover", (_, i) => {
                    popup.transition()
                         .duration(200)
                         .style("opacity", .9);
                    popup.html(matches[i].value)
                         .style("left", (d3.event.pageX - 15) + "px")
                         .style("top", (d3.event.pageY - 30) + "px");
                })
                .on("mouseout", () => {
                    popup.transition()
                         .duration(500)
                         .style("opacity", 0);
                })
        }
    }
}

$(window).resize(() => {
    clearLinks();
    drawLinks();
})