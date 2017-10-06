const SEQUENCES = [];

$(document).ready(() => {
    const NUM_SEQS = 2;
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
    let chart = d3.select("#chart");
    
    chart
    .selectAll("div")
    .data(SEQUENCES)
    .enter().each((seq) => {
        let seq_div = chart.append("div").classed("sequence", true);
        for (let i = 0; i < seq.length; i++) {
            let seg_width = $("#chart").width() / seq.length;
            seq_div.append("div")
                .classed("seq-seg", true)
                .classed("seg-" + seq[i].toUpperCase(), true)
                .style("width", seq.length / 100 + "%")
                .style("height", 30)
        }
    })
}