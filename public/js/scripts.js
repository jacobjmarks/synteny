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
                let seq_len = Math.floor(Math.random() * 100) + 50;
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
            labels: {
                display: true,
                radialOffset: 85
            },
            ticks: {
                display: false,
                spacing: 10
            }
        })
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
                opacity: 0.5
            }
        )
        .render();
}