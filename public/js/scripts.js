const SEQUENCES = [];

$(document).ready(() => {
    const NUM_SEQS = 3;
    let alphabet = "ACGT";

    for (let i = 0; i < NUM_SEQS; i++) {
        let seq = "";
        let seq_len = 250;
        for (let j = 0; j < seq_len; j++) {
            seq += alphabet[Math.floor(Math.random() * 4)];
        }
        SEQUENCES.push(seq);
    }

    drawSequences();
    drawLinks();
})

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
                        id: seqA,
                        start: i,
                        end: i + kmer_len - 1
                    },
                    target: {
                        id: seqB,
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

    // let popup = d3.select("body").append("div")	
    //     .attr("class", "tooltip")
    //     .style("background-color", "white")
    //     .style("border", "1px solid black")
    //     .style("border-radius", "3px")
    //     .style("padding", "2px 5px")
    //     .style("opacity", 0)
    
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
            let segsA = d3.select(seqs[i]).selectAll(".seq-seg").nodes();
            let segsB = d3.select(seqs[j]).selectAll(".seq-seg").nodes();

            let areaData = [];

            for (let i = 0; i < matches.length; i++) {
                let sourceStart = segsA[matches[i].source.start];
                let sourceEnd = segsA[matches[i].source.end];
                let targetStart = segsB[matches[i].target.start];
                let targetEnd = segsB[matches[i].target.end];

                areaData.push([
                    [$(sourceStart).position().left, 0],
                    [$(targetStart).position().left, $("svg").height()],
                    [$(targetEnd).position().left, $("svg").height()],
                    [$(sourceEnd).position().left, 0]
                ])
            }

            svg.selectAll("path.area")
            .data(areaData).enter()
            .append("path")
                .classed("area", true)
                .style("opacity", "0.2")
                .attr("fill", "blue")
                .attr("d", d3.area().curve(d3.curveLinear))
        }
    }
}