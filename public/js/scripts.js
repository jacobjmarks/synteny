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
            karyotype: select.karyotypes.val()
        });
    })

    btn_done = $("#btn-done");
    btn_done.click(() => {
        pullSequences();
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
        btn_done.attr("style", "display: block !important;");
    } else {
        btn_done.hide();
    }
}

function addToList(selection) {
    req_list.push(selection);
    updateList();
}

function pullSequences() {
    seq_container.empty();
    let seqs = [];
    for (let i = 0; i < req_list.length; i++) {
        let req = req_list[i];
        $.ajax({
            url: `/getSequence/${req.division}/${req.species}/${req.karyotype}`,
            method: "POST"
        })
        .done((sequence) => {
            seqs[i] = sequence;
            if (seqs.length === req_list.length) {
                drawSequences(seqs);
            }
        })
    }
}

function drawSequences(seqs) {
    for (let i = 0; i < seqs.length; i++) {
        seq_container.append(
            $("<div/>")
            .addClass("row")
            .append(
                $("<div/>")
                .addClass("col-md-12")
                .append(
                    $("<p/>")
                    .html(seqs[i])
                    .css("word-wrap", "break-word")
                )
            )
        )
    }
}