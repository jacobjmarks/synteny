window.onload = () => {
    circos = new Circos({
        container: "#chart"
    });

    compare([
        "AAAAGGCAGCCTTAACGATATCGGGGACTTGCGATGTACGTGCTTTGGTTCAATACATACGTGGCCCAGTAGTTATCCAATATCGGAACATCAATTGTACATCGGGCCGGCATAATCATGTCATCACGGAAGTAGCCGTAAGACAAATAATTCAATAAAGATGTCGTTTTGCTAGTTTACGTCAAGGTGTCACGCGCCATCTCTGAGCAGGTGGGCCGACGAGACATTATCCCTGATTTTTTCACTACTA",
        "ATAGTACTCACGGCGCAATACCAGCACAGCCTAGTCTCGCCAGAATGCTGGTCAGCATACGAAAGAGCTTAAGGCAGGCCAATTCGCACTGTCAGGGTCACTTGGGTGTTTAGCACTACCGACAGGTACGCTAGTATGCGTTCTTCCTACCAGAGGTCTGTGGCCGCGTGGTCAAAAGTGCGGCTTTCGTATTTGCTGCTCGTGTTTACTCTCACAAACTTGACCTGCACGCCAAAGAGATGCTTCTTGT",
        "GGAACTCGACAACGCAACAACGCGACGGATCTACGTCACAGCGTGCATAGTGAAAACGGAGTTGCTGACGACGAAAGCGACATTGGGATCTGTCAGTTGTCATTCGCGAAAAACATCCGTCCCCGAGGCGGACACTGATTGACGCGGTTTTGTAGAAGGTTAGGGGAATAGGTTAGATTGAGTGGCTTAAGAATGTAAAATCTGGGATTATAGTGTAGTAATCTCTGATTAACGGTGACGGTTTTAAGAC",
        "AGGTGTTCGCAAAATCAAGCGGGGTCATTTCAACAGATATTGCTGATGGTTTAGGCGTACAATGCCCTGAAGAATAATTAAGAAAAAAGCACCCCTCGTCGCCTAGAATTACCTACCGCGGTCCACCATACCTTCGATTATCGCGCCCACTCTCCCATTAGTCGGCAGAGGTGGTTGTGTTGCGATAGCCCAGTATGATATTCTAAGGCGTTACGCTGATGAATATTCTACAGAGTTGCCATAGGCGTTG",
        "AACGCTACACGGACGATACGAATTTACGTATAGAGCGGGTCATCGAAAGGTTATACTCTCGTAGTTAACATCTAGCCCGGCCCTATCAGTACAGCAGTGCCTTGAATGACATACTCATCATTAAATTTTCTCTACAGCCAAACGACCAAGTGCATTTCCAGGGAGCGCGATGGAGATTCATTCTCTCGCCAGCACTGTAATAGGCACTAAAAGAGTGATGATAATCATGAGTGCCGCGCTAAGGTGGTGT"
    ]);
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