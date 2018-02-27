function onLoadScript() {
    $(".form").submit((event) => { event.preventDefault(); enterKey(event); return false; });
}
function keyEnter(e) {
    var elem = $(e.target);
}
var added = [];
function card(e) {
    var elem = $(e.target);
    elem.val(+elem.val())
    if (elem.val() > 0) {
        findPerson(elem,".form-group:nth-child(5)").show();
    }
    else {
        findPerson(elem,"div.form-group:nth-child(5)").hide();
    }
    findPerson(elem,'.completed').attr({
        'max': $('#cards').val()
    })
}
var lastVal = 1;
var clone = null;
function groupClick(e) {
    groupChanged(e,true);
}
function groupChanged(e,bool) {
    var keyCode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (!keyCode && !bool) return;
    e.preventDefault();
    var elem = $(e.target);
    $("#group2").val(elem.val());
    $("#group").val(elem.val());
    if (clone == null) {
        clone = $("form > div.form-person:nth-child(2)").clone();
    }
    var elem = $(e.target);
    var num = +elem.val();
    var c = $("form").children;

    if (lastVal < num) {
        for (var i = lastVal; i < num; i++) {
            clone.clone().appendTo("form");
        }
    } else {
        $("form").find(".form-person:gt(" + (num - 1) + ")").remove();
    }
    lastVal = num;
}
function typing(e) {
    var elem = $(e.target);
    if (clone == null) {
        clone = $("form > div.form-person:nth-child(2)").clone();
        clone.find("#member").val("");
    }
    console.log(findPerson(elem,".role").length);
    if (elem.val().length > 0) findPerson(elem,".form-group:nth-child(2)").show();
    else findPerson(elem,".form-group:gt(1)").hide();
}
function roleClick(e) {
    e.preventDefault();
    var elem = $(e.target);
    if (elem.val() != "Select one") {
        findPerson(elem,".form-group:nth-child(4)").show();
        findPerson(elem,".form-group:nth-child(6)").show();
        if (elem.val() != "Dev") findPerson(elem,".form-group:nth-child(3)").show();
        else findPerson(elem,".form-group:nth-child(3)").hide();
    }
    else findPerson(elem,".form-group:gt(2)").hide();
}
function _completed(e) {
    e.preventDefault();
    var elem = $(e.target);
}
function _helped(e) {
    var elem = $(e.target);
    if (elem.prop("checked")) {
        findPerson(elem,".form-group:nth-child(7)").show();
    } else {
        findPerson(elem,".form-group:gt(6)").hide();
    }
}
function _helpEnter(e) {
    var elem = $(e.target);
    var keyCode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (keyCode == 13) {
        var checked = elem.prop('checked');
        if (checked) elem.prop('checked', false);
        else elem.prop('checked', true);
    }
    _helped(e);
}
function _calculate(e) {
    e.preventDefault();
    var total = 100;
    var people = [];
    var minCards = +$("#min").val();
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
            helpPerc: 0,
            rolePerc: 0,
            cardPerc: 0,
            disPerc: 0,
            effort: 0
        }
        people.push(person);
    });
    console.log("people:",people);
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
        var cardPerc = share;
        if (person.completed < minCards) {
            cardPerc = (person.completed / minCards) * share;
            distributed += (1 - (person.completed / minCards)) * share;
        }
        person.cardPerc = cardPerc;
        person.effort = cardPerc;
        if (person.role != "Dev") {
            numRoles++;
        }
        if (person.helped) {
            helpers++;
            totalHelpedHours += person.hoursHelped;
        }
        console.log(person);
    }
    console.log("numRoles: " + numRoles);
    if (numRoles <= 0) distributed += rolePerk;
    else rolePerk /= numRoles;
    if (totalHelpedHours == 0) distributed += helpPerk;
    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        if (person.role != "Dev") {
            var rolePerc = rolePerk * (person.rolestrength / 5);
            person.rolePerc = rolePerc;
            person.effort += rolePerc;
            distributed += (1 - (person.rolestrength / 5)) * rolePerk;
        }
    }
    var total = 0;
    for(var i = 0; i < people.length; i++) {
        var person = people[i];
        if (person.helped) {
            var distPerc = distributed * (person.hoursHelped / totalHelpedHours);
            person.effort += distPerc;
            person.distPerc = distPerc;
            var helpPerc = helpPerk * (person.hoursHelped / totalHelpedHours);
            person.effort += helpPerc;
            person.helpPerc = helpPerc;
        } else if (totalHelpedHours == 0) {
            person.effort += distributed / people.length;
            person.distPerc = distributed / people.length;
        }
        total += person.effort;
    }
    console.log("Total: " + total);
    $("form > div.form-person").hide();
    var elem = $(".calc");
    elem.show();
    $(".form-team").remove();
    var clone = elem.find(".form-chart:nth-child(1)").clone();
    elem.find(".form-chart:nth-child(1)").hide();
    var personData = [];
    for (var i = 0; i < people.length; i++) {
        clone = clone.clone();
        clone.appendTo(".calc");
        var person = people[i];
        personData.push({ label: person.name, y: person.effort, legendText: person.name + "'s contribution"});
        console.log("found: ",clone.find("#chartContainer"));
        console.log(person);
        var data = [];
        if (person.helpPerc > 0) data.push({ label: "Helping others/Pair programming", y: person.helpPerc / person.effort * 100, legendText: "Helping Others" });
        else data.push({ label:" Helping others/Pair programming", y: 0, legendText: "Helping Others" });
        if (person.rolePerc > 0) data.push({ label: "Role", y: person.rolePerc / person.effort * 100, legendText: "Role duties" });
        else data.push({ label: "Role", y: 0, legendText: "Role duties" });
        if (person.cardPerc > 0) data.push({ label: "Cards attempted", y: person.cardPerc / person.effort * 100, legendText: "Cards Attempted"});
        else data.push({ label: "Cards attempted", y: 0, legendText: "Cards Attempted"});
        if (person.distPerc > 0) data.push({ label: "Left-over points added from distribution", y: person.distPerc / person.effort * 100, legendText: "Distributed"});
        else data.push({ label: "Left-over points added from distribution", y: 0, legendText: "Distributed"});
        clone.find("#chartContainer").CanvasJSChart({
            title: {
                text: "Individual Effort: " + person.name,
                fontSize: 24
            },
            axisY: {
                title: "Effort in %"
            },
            legend: {
                verticalAlign: "center",
                horizontalAlign: "right"
            },
            data: [
                {
                    type: "pie",
                    showInLegend: true,
                    toolTipContent: "{label} <br/> {y} %",
                    indexLabel: "{y} %",

                    dataPoints: data
                }
            ]
        });
    }
   for (var i = 0; i < people.length; i++) {
        var person = people[i];
        var div = $(".calc > .form-chart:nth-child(" + (i + 2) + ")");
        div.find(".percent").html(person.name + "' s Effort: <b>" + person.effort + "</b>");
    }
    clone = clone.clone();
    clone.appendTo(".calc");
    clone.find("#chartContainer").CanvasJSChart({
        title: {
            text: "Total Team Effort: " + total + "%",
            fontSize: 24
        },
        axisY: {
            title: "Effort in %"
        },
        legend: {
            verticalAlign: "center",
            horizontalAlign: "right"
        },
        data: [
            {
                type: "pie",
                showInLegend: true,
                toolTipContent: "{label} <br/> {y} %",
                indexLabel: "{y} %",

                dataPoints: personData
            }
        ]
    });
    clone.find(".percent").html("");
    $(".submit").remove();
    $(".form-min").remove();
 }
function popUp(e) {
    var elem = $(e.target);
    console.log(findPerson(elem,"#myPopup").length);
    var popup = findPerson(elem,"#myPopup");
    var link = findPerson(elem,"a");
    popup.offset({left: link.position().left - popup.width() * 0.5, top: link.position().top - popup.height() * 2 });
    popup.toggle();
}
function findPerson(elem, find) {
    var i = 0;
    var select = ".form-group";
    while (i < 10 && elem.find(select).length == 0) {
        elem = elem.parent();
        i++;
    }
    return elem.find(find);

}