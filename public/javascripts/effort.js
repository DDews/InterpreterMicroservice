function onLoadScript() {
    $(".form").submit((event) => { event.preventDefault(); enterKey(event); return false; });
}
function keyEnter(e) {
    var elem = $(e.target);
}
var added = [];
function card(e) {
    var elem = $(e.target);
    $('#cards').val(+$('#cards').val())
    if (elem.val() > 0) {
        elem.parent().parent().find(".completed").show();
        elem.parent().parent().find(".helped").show();
    }
    else {
        elem.parent().parent().find(".completed").hide();
        elem.parent().parent().find(".helped").hide();
    }
    elem.closest('.form-group').find('.completed').attr({
        'max': $('#cards').val()
    })
}
var clone = null;
function groupClick(e) {
    e.preventDefault();
    if (clone == null) {
        clone = $("form > div.form-person:nth-child(2)").clone();
    }
    var elem = $(e.target);
    var num = +elem.val();
    var c = $("form").children;
    if (c.length - 1 < num) {
        clone.clone().appendTo("form");
    } else {
        $("form").find(".form-person:gt(" + (num - 1) + ")").remove();
    }
}
function typing(e) {
    var elem = $(e.target);
    if (clone == null) {
        clone = $("form > div.form-person:nth-child(2)").clone();
        clone.find("#member").val("");
    }
    console.log(elem.parent().parent().find(".role").length);
    if (elem.val().length > 0) elem.parent().parent().find(".role").show();
    else elem.parent().parent().find(".role").hide();
}
function roleClick(e) {
    e.preventDefault();
    var elem = $(e.target);
    if (elem.val() != "Select one") {
        elem.parent().parent().find(".cards").show();
        if (elem.val() != "Dev") elem.parent().parent().find(".rolestrength").show();
        else elem.parent().parent().find(".rolestrength").hide();
    }
    else elem.parent().parent().find(".cards").hide();
}
function _completed(e) {
    e.preventDefault();
    var elem = $(e.target);
}
function _helped(e) {
    var elem = $(e.target);
    if (elem.prop("checked")) {
        elem.parent().parent().find(".pp").show();
    } else {
        elem.parent().parent().find(".pp").hide();
    }
}
function _calculate(e) {
    e.preventDefault();
    var total = 100;
    var people = [];
    $(".form-person").each( function (index, element) {
        var elem = $(element);
        var person = {
            name: elem.find("#member").val(),
            role: elem.find("#role").val(),
            rolestrength: +elem.find("#rolestrength").val(),
            cards: +elem.find("#cards").val(),
            completed: +elem.find("#completed").val(),
            helped: elem.find("#helped").prop("checked"),
            hoursHelped: +elem.find("#pp").val(),
            effort: 0
        }
        people.push(person);
    });
    var share = total * 0.7;
    share /= people.length;
    var rolePerk = total * 0.15;
    var helpPerk = total * 0.15;
    var distributed = 0;
    var helpers = 0;
    var numRoles = 0;
    var totalHelpedHours = 0;
    for(var i = 0; i < people.length; i++) {
        var person = people[i];
        person.effort = (person.completed / person.cards) * share;
        distributed += (1 - (person.completed / person.cards)) * share;
        if (person.role != "Dev") {
            numRoles++;
        }
        if (person.helped) {
            helpers++;
            totalHelpedHours += person.hoursHelped;
        }
        console.log(person);
    }
    rolePerk /= numRoles;
    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        if (person.role != "Dev") {
            person.effort += rolePerk * (person.rolestrength / 5);
            distributed += (1 - (person.rolestrength / 5)) * rolePerk;
        }
    }
    var total = 0;
    for(var i = 0; i < people.length; i++) {
        var person = people[i];
        if (person.helped) {
            person.effort += distributed * (person.hoursHelped / totalHelpedHours);
            person.effort += helpPerk * (person.hoursHelped / totalHelpedHours);
        }
        total += person.effort;
    }
    console.log("Total: " + total);
}
function popUp(e) {
    var elem = $(e.target);
    console.log(elem.parent().find("#myPopup").length);
    var popup = elem.parent().find("#myPopup");
    var link = elem.parent().find("a");
    popup.offset({left: link.position().left - popup.width() * 0.5, top: link.position().top - popup.height() * 2 });
    popup.toggle();
}