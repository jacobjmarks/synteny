window.onload = () => {
    circos = new Circos({
        container: "#chart"
    });

    let alphabet = "ACGT";

    const NUM_SEQS = 4;

    compare(
        (() => {
            let seqs = [];
            for (let i = 0; i < NUM_SEQS; i++) {
                let seq = "";
                let seq_len = Math.floor(Math.random() * 100) + 25;
                for (let j = 0; j < seq_len; j++) {
                    seq += alphabet[Math.floor(Math.random() * 4)];
                }
                seqs.push(seq);
            }
            return seqs;
        })()
    );
}

const MIN_KMER = 6;

function commonKmers(seqA, seqB) {
    let kmers = [];

    // let kmer_len = seqA.length;

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

function compare(seqs) {
    let matches = [];

    for (let i = 0; i < seqs.length - 1; i++) {
        for (let j = i + 1; j < seqs.length; j++) {
            matches.push(commonKmers(seqs[i], seqs[j]));
        }
    }

    drawChart(seqs, matches);
}

function drawChart(seqs, matches) {
    let nodes = seqs.map((seq) => {
        return {
            len: seq.length,
            id: seq,
            label: seq
        }
    });

    circos
        .layout(nodes, {
            innerRadius: 320,
            outerRadius: 320,
            labels: {
                display: false,
                radialOffset: 85
            },
            ticks: {
                display: false,
                spacing: 10
            }
        })
        .text(
            'text',
            seqs.map((seq) => {
                let chars = [];
                for (let i = 0; i < seq.length; i++) {
                    chars.push({
                        block_id: seq,
                        position: i + 1,
                        value: seq[i]
                    });
                }
                return chars;
            }).reduce((a,b) => {
                return a.concat(b);
            }),
            {
                innerRadius: 1.01,              
                style: {
                    "font-size": 8,
                    "font-weight": "bold",
                }
            }
        )
        .highlight(
            'highlight',
            seqs.map((seq) => {
                let chars = [];
                for (let i = 0; i < seq.length; i++) {
                    chars.push({
                        block_id: seq,
                        start: i,
                        end: i + 1,
                        name: seq[i]
                    });
                }
                return chars;
            }).reduce((a,b) => {
                return a.concat(b);
            }),
            {
                innerRadius: 1,
                outerRadius: 0.9,
                tooltipContent: (d) => {
                    return "<p>" + d.name + "</p>";
                },
                color: "white",
                strokeColor: "black",
                strokeWidth: 1,
            }
        )
        .chords(
            'chords',
            matches.reduce((a,b) => {
                return a.concat(b);
            }).map((match) => {
                return {
                    source: match.source,
                    target: match.target
                }
            }),
            {
                color: () => {
                    return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);                    
                },
                opacity: 0.5,
                tooltipContent: (chord) => {
                    return "<h3>" + chord.value + "</h3>";
                }
            }
        )
        .render();
}