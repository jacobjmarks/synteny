window.onload = () => {
    seqA = "aaggccgtaatgaccggcagtgtcgacggcgccgaccggtccgggcctggtcccgcgaacttgaggggaacgatattctgctcaaaagaataatttgaatcaaccctcgcgtcaatgagtagaaagtgaatggggttgctttggagtgttgaagtggtcgtcatctgcaatcaccatttcttgtatcttcacgcccgtacaggacctaattaagatggtttgttacaagtacctgactataagtctgttaccgaggggatcgggggacacgacaggccctccctacgcgacgaggtaggtatggatcaaatagacactcaaaactcatgagtattgggtacctaattcgcctcttagttacccaccgcggggaccaccgcgaggaagccatttcagagtgacacctgggacggatattgaaggatctgccctgaccacggtacactactggggcgtctaattcgccgcaattgagagtatggcccctatcacacttttgcgatgggttcggtccggtcgtcgtaacacattcggagccgtgaaacgtcaatcggtacaggcccggtataactctgcttcttagtgctccagggaaacctcgaatctgaaaatatcatacaagcggtggcgttggccatttcacaggatggcgtatttaattacgattgccgattagtcagctcaagtatgcagtccaaagattatcgtccaaagaccaaactcgtcaatcaattagatgtagtgcagtggttctcatccgacgcgcgctctcacactgggggctgtagcccgctggtcttgaaagtgattttccgcgtctactgagagaaagatgcgtcgtgtgtagacgatgtgttccgatgcagcctttagatcctcgggaacatgtatacgtcgcatctgtgacgacgggaaaaatgcactcgttcgactcacgtaccgcgttgtatttctgtcccacagctgggccaagtcacactgtggtaggtctccagtacca";
    seqB = "tcgaccacgtcgtgagtggtgtaaaatgttggcatccgtaagcttaacatgtaatcgagcgtgagtctgcgatactcgtgcgactccgggactaatgtgaaattccatgcacgtttcgatattaatagtctgcggttctcttgtatgccccatgaagagatttcacagccgggtttctgccagccacacatgtcctacatcaacgtatagttgattaggccccacgcacttctagtttgcagttttaaaactatgttccagattagcgtttagagacgttgatttactgtcgcgtcttcacccaacgttgctctgcataactaagccttttctaaaagtgctgcgtctgatatatagagtagcgatagcgcgtccattcgtagctagatcaagtcagcaggacttagattcactgcccaagtagcaatcacccaatgaaacgggaacttagccgaagcggtactcttttatttcatagtggacccgacgtcctatccttgaaataattagtcaatatgacggaatgagaatgcttctaaacttaagatagtacgttcgtagctgagagctttattattagattgcttcgcctgccagatctgcattcaccagtctttgcatatggaagtcggtcaacgatcagggatgctgtgctcgtctaggctagaaccggggacctatgcatagtaccacaatatcggcgggggtctaatgcggatagagggacgggcctcggatccaaatacctcatctgaattcagacgtagaatggagggccccctatatgatcatatacatgcgacatctcgcgcgaacatgctttctagtggccatagagtggcgtcctcaactatatgaaattcagcgtctccaatccctcaagcgatgtaccccataaaatgatactaaggtgaccaagccattggcctagcgacttgtttgccgcgatagactaccgacctgatgtcagcacacctgcccttcctcaccctccacgaac";

    compare(seqA, seqB);
}

const MIN_KMER = 4;

function compare(seqA, seqB) {
    let results = [];

    let findKmers = function(seq) {
        let kmers = [];
        for (let kmer_len = seqA.length; kmer_len >= MIN_KMER; kmer_len--) {
            for (let i = 0; i <= seqA.length - kmer_len; i++) {
                let kmer = seqA.substring(i, i + kmer_len);
                kmers.push(kmer);
            }
        }
        return kmers;
    }

    let kmers = findKmers(seqA);
    let common_kmers = kmers.filter((kmer) => seqB.includes(kmer));

    drawChart(common_kmers);
}

function drawChart(kmers) {
    
}