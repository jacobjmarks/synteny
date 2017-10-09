$(document).ready(() => {
    populateDivisions();

    select = {
        divisions: $("#select-divisions"),
        species: $("#select-species"),
        assembly: $("#select-assembly")
    }

    select.divisions.change(() => {
        populateSpecies(select.divisions.val());
    })
    
    select.species.change(() => {
        populateAssembly(select.divisions.val(), select.species.val());
    })
    
    select.assembly.change(() => {
        
    })

    list_div = $("#list");
    req_list = [];

    $("#add").click(() => {
        addToList({
            division: select.divisions.val(),
            species: select.species.val(),
            karyotype: select.assembly.val()
        });
    })
})

function populateDivisions() {
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
    })
}

function populateSpecies(division) {
    select.species.empty();
    select.species.prop("disabled", true);
    select.species.selectpicker("refresh");

    select.assembly.empty();
    select.assembly.prop("disabled", true);
    select.assembly.selectpicker("refresh");

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
    })
}

function populateAssembly(division, species) {
    select.assembly.empty();
    select.assembly.prop("disabled", true);
    select.assembly.selectpicker("refresh");

    $.ajax({
        url: `/getAssembly/${division}/${species}`,
        method: "POST"
    })
    .done((karyotype) => {
        console.log(karyotype);
        for (let i = 0; i < karyotype.length; i++) {
            select.assembly.append(`<option value="${karyotype[i]}">${karyotype[i]}</option>`)
        }

        select.assembly.prop("disabled", false);
        select.assembly.selectpicker("refresh");
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
}

function addToList(selection) {
    req_list.push(selection);
    updateList();
}